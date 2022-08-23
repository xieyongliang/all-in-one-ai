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
import { getDurationByDates, getUtcDate } from '../../Utils/Helper';
import Pagination from '@mui/material/Pagination';  
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';
import { FetchDataOptions } from 'aws-northstar/components/Table';
import './index.scss'

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
    const [ disabledReview, setDisabledReview ] = useState(true)
    const [ loadingTable, setLoadingTable ] = useState(true)
    const [ visibleReview, setVisibleReview ] = useState(false)
    const [ processingReview, setProcessingReview ] = useState(true)
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ transformJobResult, setTransformJobResult ] = useState<any>({})
    const [ imageLabels,  setImageLabels ] = useState([])
    const [ imageAnnotations, setImageAnnotations ] = useState([])
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false)
    const [ imagePage, setImagePage ] = useState(1)
    const [ selectedTransformJob, setSelectedTransformJob ] = useState<TransformJobItem>()
    const [ showAll, setShowAll ] = useState(false)
    const [ visibleStopConfirmation, setVisibleStopConfirmation ] = useState(false);
    const [ processingStop, setProcessingStop ] = useState(false);
    const [ disabledStop, setDisabledStop ] = useState(true)
    const [ visibleAttachConfirmation, setVisibleAttachConfirmation ] = useState(false)
    const [ processingAttach, setProcessingAttach ] = useState(false);
    const [ disabledAttach, setDisabledAttach ] = useState(true)
    const [ visibleDetachConfirmation, setVisibleDetachConfirmation ] = useState(false)
    const [ processingDetach, setProcessingDetach ] = useState(false);
    const [ disabledDetach, setDisabledDetach ] = useState(true)   
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ transformJobCurItems, setTransformJobCurItems ] = useState([])
    const [ transformJobAllItems, setTransformJobAllItems ] = useState([])

    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
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
            var index = industrialModels.findIndex((item) => item.id === params.id)
            setImageLabels(industrialModels[index].labels)
            setCurImageItem('');
            setVisibleImagePreview(false);
            setVisibleReview(false);

            setLoadingTable(true)

            var loadedAllItems = false;
            var loadedCurItems = false;
            var transformJobAllItems = [];
            var transformJobCurItems = [];
            
            axios.get('/transformjob', {params : {'action': 'list'}})
                .then((response) => {
                    if(response.data.length === 0) {
                        loadedAllItems = true;
                        setTransformJobAllItems(transformJobAllItems);
                        if(loadedCurItems) {
                            setLoadingTable(false);
                            setSelectedTransformJob(undefined);
                        }
                    }
                    for(let item of response.data) {
                        transformJobAllItems.push(
                            {
                                transformJobName: item.TransformJobName, 
                                transformJobStatus: item.TransformJobStatus, 
                                creationTime: item.CreationTime, 
                                duration: getDurationByDates(item.TransformStartTime, item.TransformEndTime)
                            }
                        )
                        if(transformJobAllItems.length === response.data.length) {
                            loadedAllItems = true;
                            setTransformJobAllItems(transformJobAllItems);
                            if(loadedCurItems) {
                                setLoadingTable(false);
                                setSelectedTransformJob(undefined);
                            }
                        }
                    }
                }, (error) => {
                    console.log(error);
                    setLoadingTable(false);
                }
            );
            axios.get('/transformjob', {params : {'industrial_model': params.id}})
                .then((response) => {
                    if(response.data.length === 0) {
                        setTransformJobCurItems(transformJobCurItems);
                        loadedCurItems = true;
                        if(loadedAllItems) {
                            setLoadingTable(false);
                            setSelectedTransformJob(undefined);
                        }
                    }
                    for(let item of response.data) {
                        transformJobCurItems.push(
                            {
                                transformJobName: item.TransformJobName, 
                                transformJobStatus: item.TransformJobStatus, 
                                creationTime: item.CreationTime, 
                                duration: getDurationByDates(item.TransformStartTime, item.TransformEndTime)
                            }
                        )
                        if(transformJobCurItems.length === response.data.length) {
                            setTransformJobCurItems(transformJobCurItems);
                            loadedCurItems = true;
                            if(loadedAllItems) {               
                                setLoadingTable(false);
                                setSelectedTransformJob(undefined);
                            }
                        }
                    }
                }, (error) => {
                    console.log(error);
                    setLoadingTable(false);
                }
            );
    
            
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
    
        axios.get('/_file/download', {params : {'uri' : encodeURIComponent(annotationUri)}})
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
                labelsData.push(label + '\n');
            })
            setImageAnnotations(annotationData)
            setImageLabels(labelsData)
            setVisibleImagePreview(true)
        }, (error) => {
            console.log(error);
        });

    }

    const onChange = (event) => {
        setProcessingReview(true)
        setImagePage(event)
        axios.get(`/transformjob/${selectedTransformJob.transformJobName}/review`, {params: {industrial_model: params.id, page_num: event, page_size: 20}})
            .then((response) => {
                setTransformJobResult(response.data)
                setProcessingReview(false)
            }, (error) => {
                console.log(error);
            }
        );
    }

    const onSelectionChange = ((selectedItems: TransformJobItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedTransformJob(selectedItems[0])
            setDisabledStop(false)
            if(!showAll) {
                setDisabledAttach(true)
                setDisabledDetach(false)
                setDisabledReview(false)
            }
            else {
                var index = transformJobCurItems.findIndex((item) => item.transformJobName === selectedItems[0].transformJobName)
                setDisabledAttach(index >= 0)
                setDisabledDetach(index < 0) 
                setDisabledReview(index < 0)
            }
        }
    })

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=transformjob#create`)
    }

    const onReview = () => {
        setVisibleReview(true)
        axios.get(`/transformjob/${selectedTransformJob.transformJobName}/review`, {params: {industrial_model: params.id, page_num: 1, page_size: 20}})
            .then((response) => {
            setTransformJobResult(response.data)
            setProcessingReview(false)
        }, (error) => {
            alert('Error occured, please check and try it again');
            console.log(error);
        });
    }

    const onStop = () => {
        setVisibleStopConfirmation(true)
    }

    const onAttach = () => {
        setVisibleAttachConfirmation(true)
    }

    const onDetach = () => {
        setVisibleDetachConfirmation(true)
    }

    const renderStopConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleStopConfirmation}
                title={`Delete ${selectedTransformJob.transformJobName}`}
                onCancelClicked={() => setVisibleStopConfirmation(false)}
                onDeleteClicked={stopTransformJob}
                loading={processingStop}
                deleteButtonText='Stop'
            >
                <Text>This will permanently stop your transform job and cannot be undone. This may affect other resources.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const stopTransformJob = () => {
        setProcessingStop(true)
        axios.get(`/transformjob/${selectedTransformJob.transformJobName}`, {params : {industrial_model: params.id, action: 'stop'}})
            .then((response) => {
                onRefresh();
                setVisibleStopConfirmation(false);
                setProcessingStop(false);
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingStop(false)
            }
        );        
    }

    const renderAttachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleAttachConfirmation}
                title={`Attach ${selectedTransformJob.transformJobName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachTransformJob}
                loading={processingAttach}
                deleteButtonText='Attach'
            >
                <Text>This will attach this transform job to current industrial model.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const attachTransformJob = () => {
        setProcessingAttach(true)
        axios.get(`/transformjob/${selectedTransformJob.transformJobName}`, {params : {industrial_model: params.id, transform_job_name: selectedTransformJob.transformJobName, action: 'attach'}})
            .then((response) => {
                onRefresh();
                setVisibleAttachConfirmation(false);
                setProcessingAttach(false);
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingAttach(false);
            }
        );        
    }

    const renderDetachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleDetachConfirmation}
                title={`Detach ${selectedTransformJob.transformJobName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachTransformJob}
                loading={processingDetach}
                deleteButtonText='Detach'
            >
                <Text>This will dettach this transform job from current industrial model.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const detachTransformJob = () => {
        setProcessingDetach(true)
        axios.get(`/transformjob/${selectedTransformJob.transformJobName}`, {params : {industrial_model: params.id, transform_job_name: selectedTransformJob.transformJobName, action: 'detach'}})
            .then((response) => {
                onRefresh();
                setVisibleDetachConfirmation(false);
                setProcessingDetach(false);
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingDetach(false)
            }
        );        
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
                    return <a href={`/imodels/${params.id}?tab=transformjob#prop:id=${row.original.transformJobName}`}> {row.original.transformJobName} </a>;
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 400,
            Header: 'Creation time',
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getUtcDate(row.original.creationTime)
                }
                return null;
            }
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

    const onChangeShowAll = (checked) => {
        setShowAll(checked);
        if(!checked && selectedTransformJob !==undefined && transformJobCurItems.findIndex((item) => item.transformJobName === selectedTransformJob.transformJobName) < 0)
            setSelectedTransformJob(undefined);
    }

    const tableActions = (
        <Inline>
            <div className='tableaction'>        
                <Toggle label='Show all' checked={showAll} onChange={onChangeShowAll}/>
            </div>
            <div className='tableaction'>        
                <Button icon="refresh" onClick={onRefresh} loading={loadingTable}>Refresh</Button>
            </div>
            <div className='tableaction'>        
                <ButtonDropdown
                    content='Actions'
                        items={[{text: 'Review', onClick: onReview, disabled: disabledReview},{ text: 'Stop', onClick: onStop, disabled: disabledStop }, { text: 'Attach', onClick: onAttach, disabled: disabledAttach }, { text: 'Detach', onClick: onDetach, disabled: disabledDetach }, { text: 'Add/Edit tags', disabled: true }]}
                />
            </div>
            <div className='tableaction'>        
                <Button variant='primary' onClick={onCreate}>Create</Button>
            </div>
        </Inline>
    );

    const renderReview = () => {
        if(processingReview)
            return (
                <Container title = 'Select image file from batch transform result'>
                    <LoadingIndicator label='Loading...'/>
                </Container>
            )
        else
            return (
                <Stack>
                    {
                        !processingReview && 
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

    const onFetchData = (options: FetchDataOptions) => {
        setPageIndex(options.pageIndex);
    }
        
    const renderTransformJobList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Batch transform jobs'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={showAll ? transformJobAllItems : transformJobCurItems}
                loading={loadingTable}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
                selectedRowIds={selectedTransformJob !== undefined ? [selectedTransformJob.transformJobName] : []}
                onFetchData={onFetchData}
                defaultPageIndex={pageIndex}
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
        var httpUri = curImageItem
        httpUri = httpUri.substring(0, httpUri.lastIndexOf('?'))
        var imageName = httpUri.substring(httpUri.lastIndexOf('/') + 1, httpUri.lastIndexOf('.'))

        var industrialModel = industrialModels.find((item) => item.id === params.id)

        return (
            <ImageAnnotate 
                imageUris = {[curImageItem]} 
                imageLabels = {imageLabels} 
                imageColors = {COLORS}
                imageAnnotations = {imageAnnotations}
                imageNames = {[imageName]}
                projectName = {industrialModel.name}
                type = {ProjectType.TEXT_RECOGNITION}
                subType = {ProjectSubType.OBJECT_DETECTION}
                onClosed = {onImageClose}
                activeIndex = {0}
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
                { selectedTransformJob !== undefined && renderAttachConfirmationDialog() }
                { selectedTransformJob !== undefined && renderDetachConfirmationDialog() }
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