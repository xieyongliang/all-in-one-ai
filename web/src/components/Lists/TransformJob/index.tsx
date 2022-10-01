import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Container, Stack, Table, Button, Inline, ButtonDropdown, StatusIndicator, Toggle, Text, LoadingIndicator } from 'aws-northstar'
import DeleteConfirmationDialog from '../../Utils/DeleteConfirmationDialog';
import { Column } from 'react-table'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import axios from 'axios';
import { COLORS } from '../../Data/data';
import ImageAnnotate from '../../Utils/ImageAnnotate';
import Image from '../../Utils/Image';
import { PathParams } from '../../Interfaces/PathParams';
import '../../Utils/Image/index.scss'
import { getDurationByDates, getLocaleDate, logOutput } from '../../Utils/Helper';
import Pagination from '@mui/material/Pagination';  
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';
import { FetchDataOptions } from 'aws-northstar/components/Table';
import './index.scss'
import { useTranslation } from "react-i18next";

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
    const [ disabledReview, setDisabledReview ] = useState(true);
    const [ loadingTable, setLoadingTable ] = useState(true);
    const [ visibleReview, setVisibleReview ] = useState(false);
    const [ processingReview, setProcessingReview ] = useState(true);
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ transformJobResult, setTransformJobResult ] = useState<any>({});
    const [ imageLabels,  setImageLabels ] = useState([]);
    const [ imageAnnotations, setImageAnnotations ] = useState([]);
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false);
    const [ imagePage, setImagePage ] = useState(1);
    const [ selectedTransformJob, setSelectedTransformJob ] = useState<TransformJobItem>();
    const [ showAll, setShowAll ] = useState(false);
    const [ visibleStopConfirmation, setVisibleStopConfirmation ] = useState(false);
    const [ processingStop, setProcessingStop ] = useState(false);
    const [ disabledStop, setDisabledStop ] = useState(true);
    const [ visibleAttachConfirmation, setVisibleAttachConfirmation ] = useState(false);
    const [ processingAttach, setProcessingAttach ] = useState(false);
    const [ disabledAttach, setDisabledAttach ] = useState(true);
    const [ visibleDetachConfirmation, setVisibleDetachConfirmation ] = useState(false);
    const [ processingDetach, setProcessingDetach ] = useState(false);
    const [ disabledDetach, setDisabledDetach ] = useState(true);
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ transformJobCurItems, setTransformJobCurItems ] = useState([]);
    const [ transformJobAllItems, setTransformJobAllItems ] = useState([]);

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var industrialModels = props.industrialModels

    const onRefresh = useCallback(() => {
        if(industrialModels.length > 0) {
            var index = industrialModels.findIndex((item) => item.id === params.id)
            setImageLabels(JSON.parse(industrialModels[index].extra).labels)
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
                    logOutput('error', error.response.data, undefined, error);
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
                    logOutput('error', error.response.data, undefined, error);
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
            logOutput('error', error.response.data, undefined, error);
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
                logOutput('error', error.response.data, undefined, error);
            }
        );
    }

    const onSelectionChange = ((selectedItems: TransformJobItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedTransformJob(selectedItems[0])
            
            var transformJobCurItem = transformJobCurItems.find((item) => item.transformJobName === selectedItems[0].transformJobName)
            var transformJobAllItem = transformJobAllItems.find((item) => item.transformJobName === selectedItems[0].transformJobName)

            if(!showAll) {
                setDisabledStop(transformJobCurItem.transformJobStatus !== 'InProgress')
                setDisabledAttach(true)
                setDisabledDetach(false)
                setDisabledReview(false)
            }
            else {
                setDisabledStop(transformJobAllItem.transformJobStatus !== 'InProgress')
                setDisabledAttach(transformJobCurItem !== undefined)
                setDisabledDetach(transformJobCurItem === undefined) 
                setDisabledReview(transformJobCurItem === undefined)
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
            logOutput('error', error.response.data, undefined, error);
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
                title={t('industrial_models.common.stop') + ` ${selectedTransformJob.transformJobName}`}
                onCancelClicked={() => setVisibleStopConfirmation(false)}
                onDeleteClicked={stopTransformJob}
                loading={processingStop}
                deleteButtonText={t('industrial_models.common.stop')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.transform_job.stop_transform_job')}</Text>
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
                logOutput('error', error.response.data, undefined, error);
                setProcessingStop(false);
            }
        );        
    }

    const renderAttachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleAttachConfirmation}
                title={t('industrial_models.common.attach') + ` ${selectedTransformJob.transformJobName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachTransformJob}
                loading={processingAttach}
                deleteButtonText={t('industrial_models.common.attach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.transform_job.attach_transform_job')}</Text>
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
                logOutput('error', error.response.data, undefined, error);
                setProcessingAttach(false);
            }
        );        
    }

    const renderDetachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleDetachConfirmation}
                title={t('industrial_models.common.detach') + ` ${selectedTransformJob.transformJobName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachTransformJob}
                loading={processingDetach}
                deleteButtonText={t('industrial_models.common.detach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.transform_job.detach_transform_job')}</Text>
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
                logOutput('error', error.response.data, undefined, error);
                setProcessingDetach(false);
            }
        );        
    }

    const getRowId = useCallback(data => data.transformJobName, []);

    const columnDefinitions : Column<TransformJobItem>[]= [
        {
            id: 'transformJobName',
            width: 200,
            Header: t('industrial_models.common.name'),
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
            Header: t('industrial_models.common.creation_time'),
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getLocaleDate(row.original.creationTime)
                }
                return null;
            }
        },
        {
            id: 'duration',
            width: 200,
            Header: t('industrial_models.common.duration'),
            accessor: 'duration'
        },
        {
            id: 'transformJobStatus',
            width: 200,
            Header: t('industrial_models.common.status'),
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
                <Toggle label={t('industrial_models.common.show_all')} checked={showAll} onChange={onChangeShowAll}/>
            </div>
            <div className='tableaction'>        
                <Button icon="refresh" onClick={onRefresh} loading={loadingTable}>{t('industrial_models.common.refresh')}</Button>
            </div>
            <div className='tableaction'>        
                <ButtonDropdown
                    content={t('industrial_models.common.actions')}
                        items={[{text: t('industrial_models.common.review'), onClick: onReview, disabled: disabledReview},{ text: t('industrial_models.common.stop'), onClick: onStop, disabled: disabledStop }, { text: t('industrial_models.common.attach'), onClick: onAttach, disabled: disabledAttach }, { text: t('industrial_models.common.detach'), onClick: onDetach, disabled: disabledDetach }, { text: t('industrial_models.common.add_or_edit_tags'), disabled: true }]}
                />
            </div>
            <div className='tableaction'>        
                <Button variant='primary' onClick={onCreate}>{t('industrial_models.common.create')}</Button>
            </div>
        </Inline>
    );

    const renderReview = () => {
        if(processingReview)
            return (
                <Container title = 'Select image file from batch transform result'>
                    <LoadingIndicator label={t('industrial_models.demo.loading')}/>
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
                                            httpuri={item}
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
                tableTitle={t('industrial_models.transform_jobs')}
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
            </Stack>
        )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(TransformJobList);