import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Container, FormField, Stack, Table, Button, Inline, ButtonDropdown, StatusIndicator, Flashbar } from 'aws-northstar'
import { Column } from 'react-table'
import axios from 'axios';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import URLImage from '../../Utils/URLImage';
import {LABELS, COLORS, CaseType} from '../../Data/data';
import ImageAnnotate from '../../Utils/Annotate';
import Image from '../../Utils/Image';
import { PathParams } from '../../Interfaces/PathParams';

interface TransformJobItem {
    name: string;
    creation_time: string;
    duration: string;
    status?: string;
}

const TransformJobList: FunctionComponent = () => {
    const [items, setItems] = useState([])
    const [selectedTransformJob, setSelectedTransformJob] = useState('')
    const [enabledReview, setEnabledReview] = useState(false)
    const [loadingTable, setLoadingTable] = useState(true)
    const [visibleReview, setVisibleReview] = useState(false)
    const [loadingReview, setLoadingReview] = useState(true)
    const [currentImage, setCurrentImage] = useState('')
    const [transformJobResult, setTransformJobResult] = useState<any>({})
    const [visibleAnnotate, setVisibleAnnotate] = useState(false);
    const [id, setId] = useState<number[]>([])
    const [bbox, setBbox] = useState<number[][]>([])
    const [labels,  setLabels] = useState([])
    const casename = useRef('');

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        axios.get('/transformjob', {params : {'case': params.name}})
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({name: item.transformjob_name, status : item.status, duration: item.duration, creation_time: item.creation_time})
            }
            setItems(items);
            setLoadingTable(false);
            setVisibleAnnotate(false);
            setVisibleReview(false);
            setCurrentImage('');
            if(params.name === 'track')
                setLabels(LABELS[CaseType.TRACK])
            else if(params.name === 'mask')
                setLabels(LABELS[CaseType.FACE])
        }, (error) => {
            console.log(error);
        });
    }, [params.name]);
    
    const onImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        const src = event.currentTarget.src
        setCurrentImage(src)
        var annotationUri = transformJobResult.output[transformJobResult.input.indexOf(src)]
        console.log(annotationUri)
    
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
            if(selectedTransformJob !== event[0].name) {
                setSelectedTransformJob(event[0].name)
                setEnabledReview(true)
            }
        }
    }
)

    const onCreate = () => {
        history.push('/case/' + params.name + '?tab=demo#review')
    }

    const onReview = () => {
        setVisibleReview(true)
        axios.get('/transformjob/' + selectedTransformJob + '/review?case=' + params.name)
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

    
    const getRowId = React.useCallback(data => data.name, []);

    const columnDefinitions : Column<TransformJobItem>[]= [
        {
            id: 'name',
            width: 200,
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const name = row.original.name;
                    return <a href={'/case/' + params.name +'?tab=demo#prop:id=' + name}> {name} </a>;
                }
                return null;
            }
        },
        {
            id: 'creation_time',
            width: 200,
            Header: 'Creation time',
            accessor: 'creation_time'
        },
        {
            id: 'duration',
            width: 200,
            Header: 'Duration',
            accessor: 'duration'
        },
        {
            id: 'status',
            width: 200,
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.status;
                    switch(status) {
                        case 'Completed':
                            return <StatusIndicator  statusType='positive'>Completed</StatusIndicator>;
                        case 'Failed':
                            return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                        case 'InProgress':
                            return <StatusIndicator  statusType='info'>In progress</StatusIndicator>;
                        case 'Stopped':
                                return <StatusIndicator  statusType='warning'>Error</StatusIndicator>;
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
                content="Action"
                    items={[{ text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );

    if(visibleAnnotate) {
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
            <Container title = "Image annotation">
                <ImageAnnotate imageUri={currentImage} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant="primary" onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
    }
    else if(visibleReview) {
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
                    !loadingReview && <Container title = "Select image file from batch transform result">
                    <ImageList cols={12} rowHeight={64} gap={10} variant={'quilted'} style={{"height":"550px"}}>
                        {transformJobResult.input.map((item, index) => (
                            <ImageListItem key={item} rows={2}>
                                <Image
                                    src={item}
                                    width={128}
                                    height={12}
                                    current={currentImage}
                                    onClick={onImageClick}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Container>
                }
                {
                    !loadingReview && 
                    <Container title = "Start inference">
                        <FormField controlId='button'>
                            <URLImage src={currentImage} colors={COLORS} labels={labels} id={id} bbox={bbox}/>
                        </FormField>
                        <FormField controlId='button'>
                            <Button onClick={onAnnotate} disabled={bbox.length === 0}>Annotate</Button>
                        </FormField>
                    </Container>
                }
            </Stack>
        )
    }
    else {
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
}

export default TransformJobList;