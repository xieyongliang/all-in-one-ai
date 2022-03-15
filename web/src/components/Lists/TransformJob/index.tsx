import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Container, FormField, Stack, Table, Button, Inline, ButtonDropdown, StatusIndicator, Flashbar, Toggle, Link } from 'aws-northstar'
import { Column } from 'react-table'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import URLImage from '../../Utils/URLImage';
import {LABELS, COLORS, CaseType} from '../../Data/data';
import ImageAnnotate from '../../Utils/Annotate';
import Image from '../../Utils/Image';
import { PathParams } from '../../Interfaces/PathParams';
import '../../Utils/Image/index.scss'
import { getDurationByDates } from '../../Utils/Helper';

interface TransformJobItem {
    transformJobName: string;
    transformJobStatus: string;
    creationTime: string;
    duration?: string;
}

const TransformJobList: FunctionComponent = () => {
    const [ items ] = useState([])
    const [ selectedTransformJob, setSelectedTransformJob ] = useState('')
    const [ enabledReview, setEnabledReview ] = useState(false)
    const [ loadingTable, setLoadingTable ] = useState(true)
    const [ visibleReview, setVisibleReview ] = useState(false)
    const [ loadingReview, setLoadingReview ] = useState(true)
    const [ currentImage, setCurrentImage ] = useState('')
    const [ transformJobResult, setTransformJobResult ] = useState<any>({})
    const [ visibleAnnotate, setVisibleAnnotate ] = useState(false);
    const [ id, setId ] = useState<number[]>([])
    const [ bbox, setBbox ] = useState<number[][]>([])
    const [ labels,  setLabels ] = useState([])
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const casename = useRef('');

    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        casename.current = params.name;
        const request1 = axios.get('/transformjob', {params : {'case': params.name}});
        const request2 = axios.get('/function/all_in_one_ai_create_transform_job?action=code');
        const request3 = axios.get('/function/all_in_one_ai_create_transform_job?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            if(cancel) return;
            for(let item of response1.data) {
                items.push({transformJobName: item.TransformJobName, transformJobStatus : item.TransformJobStatus, duration: getDurationByDates(item.TransformStartTime, item.TransformEndTime), creationTime: item.CreationTime})
            }
            setLoadingTable(false);
            setVisibleAnnotate(false);
            setVisibleReview(false);
            setCurrentImage('');
            if(params.name === 'track')
                setLabels(LABELS[CaseType.TRACK])
            else if(params.name === 'mask')
                setLabels(LABELS[CaseType.FACE])
            
            getSourceCode(response2.data).then((data) => {
                if(cancel) return;
                var zip = new JSZip();
                zip.loadAsync(data).then(async function(zipped) {
                    zipped.file('lambda_function.py').async('string').then(function(data) {
                        if(cancel) return;
                        setSampleCode(data)
                    })
                })
            });
            setSampleConsole(response3.data)
        }));

        return () => { 
            cancel = true;
        }
    },[params.name, items]);
        
    const onImageClick = (src) => {
        setId([]);
        setBbox([]);
        setCurrentImage(src);
        
        var annotationUri = transformJobResult.output[transformJobResult.input.indexOf(src)];
    
        axios.get('/file/download', {params : {'uri' : encodeURIComponent(annotationUri)}})
        .then((response) => {
            var tbbox : number[][] = [];
            var tid = [];
            for(let item of response.data) {
                var numbers = item.split(' ');
                tid.push(parseInt(item[0]));
                var box : number[] = [];
                box.push(parseFloat(numbers[1]));
                box.push(parseFloat(numbers[2]));
                box.push(parseFloat(numbers[3]));
                box.push(parseFloat(numbers[4]));
                tbbox.push(box);
            }
            setId(tid);
            setBbox(tbbox);
        }, (error) => {
            console.log(error);
        });

    }

    const onChange = ((id: string, event: any) => {
        if(event.length > 0) {
            setSelectedTransformJob(event[0].transformJobName)
            setEnabledReview(true)
        }
    }
)

    const onCreate = () => {
        history.push(`/case/${params.name}?tab=demo#review`)
    }

    const onReview = () => {
        setVisibleReview(true)
        axios.get(`/transformjob/${selectedTransformJob}/review?case=${params.name}`)
            .then((response) => {
            setTransformJobResult(response.data)
            setLoadingReview(false)
        }, (error) => {
            console.log(error);
        });
    }

    const onAnnotate = () => {
        setVisibleAnnotate(true);
    }
    
    const getRowId = React.useCallback(data => data.transformJobName, []);

    const columnDefinitions : Column<TransformJobItem>[]= [
        {
            id: 'transformJobName',
            width: 200,
            Header: 'Name',
            accessor: 'transformJobName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=demo#prop:id=${row.original.transformJobName}`}> {row.original.transformJobName} </a>;
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 200,
            Header: 'Creation time',
            accessor: 'creationTime'
        },
        {
            id: 'duration',
            width: 200,
            Header: 'Duration',
            accessor: 'duration'
        },
        {
            id: 'transformJobStatus',
            width: 200,
            Header: 'Status',
            accessor: 'transformJobStatus',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.transformJobStatus;
                    switch(status) {
                        case 'Completed':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'Failed':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'InProgress':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        case 'Stopped':
                                return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        }
    ];

    const tableActions = (
        <Inline>
            <Button onClick={onReview} disabled={!enabledReview}>
                Review
            </Button>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );

    const renderAnnotate = () => {
        var annotationData : string[] = [];
        var index = 0;
        bbox.forEach(item => {
            var annotation : string = id[index] + ' ' + item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3] + '\r';
            annotationData.push(annotation);
            index++;
        });
        var labelsData : string[] = [];
        labels.forEach(label => {
            labelsData.push(label + '\r');
        })
            
        return (
            <Container title = 'Image annotation'>
                <ImageAnnotate imageUri={currentImage} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant='primary' onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
    }

    const renderReview = () => {
        return (
            <Stack>
                {   
                    loadingReview && <Flashbar items={[{
                        header: 'Loading batch transform result...',
                        content: 'This may take up to an minute. Please wait a bit...',
                        dismissible: true,
                        loading: loadingReview
                    }]} />
                }
                {
                    !loadingReview && <Container title = 'Select image file from batch transform result'>
                    <ImageList cols={12} rowHeight={64} gap={10} variant={'quilted'} style={{'height':'550px'}}>
                        {transformJobResult.input.map((item, index) => (
                            <ImageListItem key={item} rows={2}>
                                <Image
                                    src={item}
                                    width={128}
                                    height={128}
                                    current={currentImage}
                                    onClick={onImageClick}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Container>
                }
                {
                    !loadingReview && <Container title = 'Preview'>
                        <FormField controlId='button'>
                            <div className='watermarked'>
                                <URLImage src={currentImage} colors={COLORS} labels={labels} id={id} bbox={bbox}/>
                            </div>
                        </FormField>
                        <FormField controlId='button'>
                            <Button onClick={onAnnotate} disabled={bbox.length === 0}>Annotate</Button>
                        </FormField>
                    </Container>
                }
            </Stack>            
        )
    }

    const renderTransformJobList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Batch transform jobs'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={items}
                onSelectionChange={(event) => onChange('formFieldIdTable', event)}
                getRowId={getRowId}
                loading={loadingTable}
            />
        )    
    }

    const renderSampleCode = () => {
        return (
            <Container title = 'Sample code'>
                <Toggle label={visibleSampleCode ? 'Show sample code' : 'Hide sample code'} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <Link href={sampleConsole}>Open in AWS Lambda console</Link>
                {
                    visibleSampleCode && <SyntaxHighlighter language='python' style={github} showLineNumbers={true}>
                        {sampleCode}
                    </SyntaxHighlighter>
                }
            </Container>
        )
    }

    if(visibleAnnotate) 
        return renderAnnotate()
    else if(visibleReview) 
        return renderReview()
    else 
        return (
            <Stack>
                {renderTransformJobList()}
                {renderSampleCode()}
            </Stack>
        )
}

export default TransformJobList;