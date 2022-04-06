import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Container, Stack, Table, Button, Inline, ButtonDropdown, StatusIndicator, Toggle, Link, Text, DeleteConfirmationDialog, LoadingIndicator } from 'aws-northstar'
import { Column } from 'react-table'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { COLORS } from '../../Data/data';
import ImageAnnotate from '../../Utils/ImageAnnotate';
import Image from '../../Utils/Image';
import { PathParams } from '../../Interfaces/PathParams';
import '../../Utils/Image/index.scss'
import { getDurationByDates } from '../../Utils/Helper';
import Pagination from '@mui/material/Pagination';  
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { ProjectType } from '../../../data/enums/ProjectType';

interface TransformJobItem {
    transformJobName: string;
    transformJobStatus: string;
    creationTime: string;
    duration?: string;
}

interface IProps {
    industrialModels: IIndustrialModel[];
}

const TransformJobList: FunctionComponent<IProps> = (props) => {
    const [ transformJobItems, setTransformJobItems ] = useState([])
    const [ enabledReview, setEnabledReview ] = useState(false)
    const [ loadingTable, setLoadingTable ] = useState(true)
    const [ visibleReview, setVisibleReview ] = useState(false)
    const [ loadingReview, setLoadingReview ] = useState(true)
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ transformJobResult, setTransformJobResult ] = useState<any>({})
    const [ imageLabels,  setImageLabels ] = useState([])
    const [ imageAnnotations, setImageAnnotations ] = useState([])
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false)
    const [ imagePage, setImagePage ] = useState(0)
    const [ stopConfirmationDialogVisible, setStopConfirmationDialogVisiable ] = useState(false);
    const [ isStopProcessing, setIsStopProcessing ] = useState(false);
    const [ selectedTransformJob, setSelectedTransformJob ] = useState<TransformJobItem>()
    const [ stopDisabled, setStopDisabled ] = useState(true)

    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_invoke_endpoint?action=code'), axios.get('/function/all_in_one_ai_invoke_endpoint?action=console')];
        axios.all(requests)
        .then(axios.spread(function(response0, response1) {
            getSourceCode(response0.data).then((data) => {
                if(cancel) return;
                var zip = new JSZip();
                zip.loadAsync(data).then(async function(zipped) {
                    zipped.file('lambda_function.py').async('string').then(function(data) {
                        if(cancel) return;
                        setSampleCode(data)
                    })
                })
            });
            setSampleConsole(response1.data)           
        }));
        return () => { 
            cancel = true;
        }
    }, []);

    var industrialModels = props.industrialModels

    const onRefresh = useCallback(() => {
        if(industrialModels.length > 0) {
            var transformJobItems = []
            var index = industrialModels.findIndex((item) => item.id === params.id)
            setImageLabels(industrialModels[index].labels)
            setCurImageItem('');
            setVisibleImagePreview(false);
            setVisibleReview(false);

            setLoadingTable(true)
            axios.get('/transformjob', {params : {'industrial_model': params.id}})
                .then((response) => {
                    if(response.data.length === 0) {
                        setTransformJobItems(transformJobItems);
                        setLoadingTable(false);
                    }
                    else
                        for(let item of response.data) {
                            transformJobItems.push({transformJobName: item.TransformJobName, transformJobStatus : item.TransformJobStatus, duration: getDurationByDates(item.TransformStartTime, item.TransformEndTime), creationTime: item.CreationTime})
                            if(transformJobItems.length === response.data.length) {
                                setTransformJobItems(transformJobItems);
                                setLoadingTable(false);
                            }
                        }
                }
            )
        }
    }, [params.id, industrialModels])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const onImageClose = () => {
        setVisibleImagePreview(false);
    }

    const onImageClick = (src) => {
        setCurImageItem(src);
        
        var annotationUri = transformJobResult.output[transformJobResult.input.indexOf(src)];
    
        axios.get('/file/download', {params : {'uri' : encodeURIComponent(annotationUri)}})
        .then((response) => {
            var imageBboxs : number[][] = [];
            var imageIds = [];
            for(let item of response.data) {
                var numbers = item.split(' ');
                imageIds.push(parseInt(item[0]));
                var box : number[] = [];
                box.push(parseFloat(numbers[1]));
                box.push(parseFloat(numbers[2]));
                box.push(parseFloat(numbers[3]));
                box.push(parseFloat(numbers[4]));
                imageBboxs.push(box);
            }
            var annotationData : string[] = [];
            var index = 0;
            imageBboxs.forEach(item => {
                var annotation : string = imageIds[index] + ' ' + item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3] + '\r';
                annotationData.push(annotation);
                index++;
            });
            var labelsData : string[] = [];
            imageLabels.forEach(label => {
                labelsData.push(label + '\r');
            })
            setImageAnnotations(annotationData)
            setImageLabels(labelsData)
            setVisibleImagePreview(true)
        }, (error) => {
            console.log(error);
        });

    }

    const onChange = (event) => {
        setLoadingReview(true)
        setImagePage(event)
        axios.get(`/transformjob/${selectedTransformJob.transformJobName}/review`, {params: {'industrial_model': params.id, 'page_num': event, 'page_size': 20}})
            .then((response) => {
                setTransformJobResult(response.data)
                setLoadingReview(false)
            }, (error) => {
                console.log(error);
            }
        );
    }

    const onSelectionChange = ((event: any) => {
        if(event.length > 0) {
            setSelectedTransformJob(event[0])
            setStopDisabled(false)
            setEnabledReview(true)
        } 
    })

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=demo#review`)
    }

    const onReview = () => {
        setVisibleReview(true)
        axios.get(`/transformjob/${selectedTransformJob.transformJobName}/review`, {params: {'industrial_model': params.id, 'page_num': 1, 'page_size': 20}})
            .then((response) => {
            setTransformJobResult(response.data)
            setLoadingReview(false)
        }, (error) => {
            console.log(error);
        });
    }

    const onStop = () => {
        setStopConfirmationDialogVisiable(true)
    }

    const renderStopConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={stopConfirmationDialogVisible}
                title={`Delete ${selectedTransformJob.transformJobName}`}
                onCancelClicked={() => setStopConfirmationDialogVisiable(false)}
                onDeleteClicked={stopTrainingJob}
                loading={isStopProcessing}
            >
                <Text>This will permanently delete your model and cannot be undone. This may affect other resources.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const stopTrainingJob = () => {
        axios.get('/transformjob', {params : {industrial_model: params.id, training_job_name: selectedTransformJob.transformJobName, action: 'stop'}})
        .then((response) => {
            onRefresh()
            setStopConfirmationDialogVisiable(false)
            setIsStopProcessing(false)
        }, (error) => {
            console.log(error);
        });        
    }


    const getRowId = useCallback(data => data.transformJobName, []);

    const columnDefinitions : Column<TransformJobItem>[]= [
        {
            id: 'transformJobName',
            width: 200,
            Header: 'Name',
            accessor: 'transformJobName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=demo#prop:id=${row.original.transformJobName}`}> {row.original.transformJobName} </a>;
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 400,
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
            <Button variant="icon" icon="refresh" size="small" onClick={onRefresh}/>
            <Button onClick={onReview} disabled={!enabledReview}>
                Review
            </Button>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Stop', onClick: onStop, disabled: stopDisabled }, { text: 'Add/Edit tags', disabled: true }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );

    const renderReview = () => {
        if(loadingReview)
            return (
                <Container title = 'Select image file from batch transform result'>
                    <LoadingIndicator label='Loading...'/>
                </Container>
            )
        else
            return (
                <Stack>
                    {
                        !loadingReview && 
                        <Container title = 'Select image file from batch transform result'>
                            <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'} >
                                {transformJobResult.input.map((item) => (
                                    <ImageListItem key={item} rows={2}>
                                        <Image
                                            src={item}
                                            width={128}
                                            height={128}
                                            current={curImageItem}
                                            onClick={onImageClick}
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                            <Pagination page={imagePage} onChange={onChange} count={Math.ceil(transformJobResult.count / 20)} />
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
                items={transformJobItems}
                onSelectionChange={onSelectionChange}
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
                    visibleSampleCode && 
                    <SyntaxHighlighter language='python' style={github} showLineNumbers={true}>
                        {sampleCode}
                    </SyntaxHighlighter>
                }
            </Container>
        )
    }

    const renderImagePreview = () => {
        return (
            <ImageAnnotate 
                imageUri={curImageItem} 
                imageLabels={imageLabels} 
                imageColors={COLORS}
                imageAnnotations={imageAnnotations}
                type={ProjectType.OBJECT_DETECTION_RECT}
                visible={visibleImagePreview} 
                onClose={onImageClose}
            />
        )
    }

    if(visibleReview)
        if(visibleImagePreview)
            return renderImagePreview()
        else
            return renderReview()
    else 
        return (
            <Stack>
                { selectedTransformJob !== undefined && renderStopConfirmationDialog() }
                {renderTransformJobList()}
                {renderSampleCode()}
            </Stack>
        )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(TransformJobList);