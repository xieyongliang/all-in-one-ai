import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Column } from 'react-table'
import { Button, ButtonDropdown, StatusIndicator, Table, Toggle, Text } from 'aws-northstar/components';
import { Inline, Stack }  from 'aws-northstar/layouts';
import DeleteConfirmationDialog from '../../Utils/DeleteConfirmationDialog';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getDurationBySeconds, getUtcDate } from '../../Utils/Helper/index';
import { FetchDataOptions } from 'aws-northstar/components/Table';
import './index.scss'
import { useTranslation } from "react-i18next";

interface TrainingJobItem {
    trainingJobName: string;
    creationTime: string;
    duration: string;
    trainingJobStatus?: string;
}

const TrainingJobList: FunctionComponent = () => {
    const [ loading, setLoading ] = useState(true);
    const [ selectedTrainingJob, setSelectedTrainingJob ] = useState<TrainingJobItem>()
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
    const [ trainingJobCurItems, setTrainingJobCurItems ] = useState([])
    const [ trainingJobAllItems, setTrainingJobAllItems ] = useState([])
    
    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    const onRefresh = useCallback(() => {
        setLoading(true)

        var loadedAllItems = false;
        var loadedCurItems = false;
        var trainingJobAllItems = [];
        var trainingJobCurItems = [];
        
        axios.get('/trainingjob', {params : {'action': 'list'}})
            .then((response) => {
                if(response.data.length === 0) {
                    loadedAllItems = true;
                    setTrainingJobAllItems(trainingJobAllItems);
                    if(loadedCurItems) {
                        setLoading(false);
                        setSelectedTrainingJob(undefined);
                    }
                }
                for(let item of response.data) {
                    trainingJobAllItems.push(
                        {
                            trainingJobName: item.TrainingJobName, 
                            trainingJobStatus : item.TrainingJobStatus, 
                            duration: getDurationBySeconds(parseInt(item.TrainingTimeInSeconds)), 
                            creationTime: item.CreationTime
                        }
                    )
                    if(trainingJobAllItems.length === response.data.length) {
                        loadedAllItems = true;
                        setTrainingJobAllItems(trainingJobAllItems);
                        if(loadedCurItems) {
                            setLoading(false);
                            setSelectedTrainingJob(undefined);
                        }
                    }
                }
            }, (error) => {
                console.log(error);
                setLoading(false);
            }
        );
        axios.get('/trainingjob', {params : {'industrial_model': params.id}})
            .then((response) => {
                if(response.data.length === 0) {
                    setTrainingJobCurItems(trainingJobCurItems);
                    loadedCurItems = true;
                    if(loadedAllItems) {
                        setLoading(false);
                        setSelectedTrainingJob(undefined);
                    }
                }
                for(let item of response.data) {
                    trainingJobCurItems.push(
                        {
                            trainingJobName: item.TrainingJobName, 
                            trainingJobStatus : item.TrainingJobStatus, 
                            duration: getDurationBySeconds(parseInt(item.TrainingTimeInSeconds)), 
                            creationTime: item.CreationTime
                        }
                    )
                    if(trainingJobCurItems.length === response.data.length) {
                        setTrainingJobCurItems(trainingJobCurItems);
                        loadedCurItems = true;
                        if(loadedAllItems) {               
                            setLoading(false);
                            setSelectedTrainingJob(undefined);
                        }
                    }
                }
            }, (error) => {
                console.log(error);
                setLoading(false);
            }
        );
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);


    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=trainingjob#create`)
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
                title={t('industrial_models.common.stop') + ` ${selectedTrainingJob.trainingJobName}`}
                onCancelClicked={() => setVisibleStopConfirmation(false)}
                onDeleteClicked={stopTrainingJob}
                loading={processingStop}
                deleteButtonText={t('industrial_models.common.stop')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.training_job.stop_training_job')}</Text>
            </DeleteConfirmationDialog>
        )
    }

    const stopTrainingJob = () => {
        axios.get('/trainingjob', {params : {industrial_model: params.id, training_job_name: selectedTrainingJob, action: 'stop'}})
            .then((response) => {
                onRefresh();
                setVisibleStopConfirmation(false);
                setProcessingStop(false);
            }, (error) => {
                alert(t('industrial_models.common.error_occured'));
                console.log(error);
                setProcessingStop(false);
            }
        );        
    }

    const renderAttachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleAttachConfirmation}
                title={t('industrial_models.common.attach') + ` ${selectedTrainingJob.trainingJobName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachTrainingJob}
                loading={processingAttach}
                deleteButtonText={t('industrial_models.common.attach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.training_job.attach_training_job')}</Text>
            </DeleteConfirmationDialog>
        )
    }

    const attachTrainingJob = () => {
        setProcessingAttach(true)
        axios.get(`/trainingjob/${selectedTrainingJob.trainingJobName}`, {params: {industrial_model: params.id, action: 'attach'}})
            .then((data) => {
                onRefresh();
                setVisibleAttachConfirmation(false);
                setProcessingAttach(false);
            }, (error) => {
                alert(t('industrial_models.common.error_occured'));
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
                title={t('industrial_models.common.detach') + ` ${selectedTrainingJob.trainingJobName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachTrainingJob}
                loading={processingDetach}
                deleteButtonText={t('industrial_models.common.detach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.training_job.detach_training_job')}</Text>
            </DeleteConfirmationDialog>
        )
    }

    const detachTrainingJob = () => {
        setProcessingDetach(true)
        axios.get(`/trainingjob/${selectedTrainingJob.trainingJobName}`, {params: {industrial_model: params.id, action: 'detach'}})
            .then((data) => {
                onRefresh();
                setVisibleDetachConfirmation(false);
                setProcessingDetach(false);
            }, (error) => {
                alert(t('industrial_models.common.error_occured'));
                console.log(error);
                setProcessingDetach(false);
            }
        );
    }    

    const getRowId = useCallback(data => data.trainingJobName, []);

    const columnDefinitions : Column<TrainingJobItem>[]= [
        {
            id: 'trainingJobName',
            width: 500,
            Header: t('industrial_models.common.name'),
            accessor: 'trainingJobName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=trainingjob#prop:id=${row.original.trainingJobName}`}> {row.original.trainingJobName} </a>;
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 200,
            Header: t('industrial_models.common.creation_time'),
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
            Header: t('industrial_models.common.duration'),
            accessor: 'duration'
        },
        {
            id: 'trainingJobStatus',
            width: 200,
            Header: t('industrial_models.common.status'),
            accessor: 'trainingJobStatus',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.trainingJobStatus;
                    switch(status) {
                        case 'Completed':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'Failed':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'InProgress':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        case 'Stopped':
                        case 'Stopping':
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
        if(!checked && selectedTrainingJob !==undefined && trainingJobCurItems.findIndex((item) => item.trainingJobName === selectedTrainingJob.trainingJobName) < 0)
            setSelectedTrainingJob(undefined);
    }
    
    const tableActions = (
        <Inline>
            <div className='tableaction'>
                <Toggle label={t('industrial_models.common.show_all')} checked={showAll} onChange={onChangeShowAll}/>
            </div>
            <div className='tableaction'>
                <Button icon='refresh' onClick={onRefresh} loading={loading}>{t('industrial_models.common.refresh')}</Button>
            </div>
            <div className='tableaction'>
                <ButtonDropdown
                    content={t('industrial_models.common.actions')}
                        items={[{ text: t('industrial_models.common.stop'), onClick: onStop, disabled: disabledStop }, { text: t('industrial_models.common.attach'), onClick: onAttach, disabled: disabledAttach }, { text: t('industrial_models.common.detach'), onClick: onDetach, disabled: disabledDetach }, { text: t('industrial_models.common.add_or_edit_tags'), disabled: true }]}
                />
            </div>
            <div className='tableaction'>
                <Button variant='primary' onClick={onCreate}>{t('industrial_models.common.create')}</Button>
            </div>
        </Inline>
    );

    const onSelectionChange = (selectedItems: TrainingJobItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedTrainingJob(selectedItems[0])

            var trainingJobCurItem = trainingJobCurItems.find((item) => item.trainingJobName === selectedItems[0].trainingJobName)
            var trainingJobAllItem = trainingJobAllItems.find((item) => item.trainingJobName === selectedItems[0].trainingJobName)
            
            if(!showAll) {
                setDisabledStop(trainingJobCurItem.trainingJobStatus !== 'InProgress')
                setDisabledAttach(true)
                setDisabledDetach(false)
            }
            else {
                setDisabledStop(trainingJobAllItem.trainingJobStatus !== 'InProgress')
                setDisabledAttach(trainingJobCurItem !== undefined) 
                setDisabledDetach(trainingJobCurItem === undefined) 
            }
        }
    }
    
    const onFetchData = (options: FetchDataOptions) => {
        setPageIndex(options.pageIndex);
    }

    const renderTrainingJobList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle={t('industrial_models.training_jobs')}
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={showAll ? trainingJobAllItems : trainingJobCurItems}
                loading={loading}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
                selectedRowIds={selectedTrainingJob !== undefined ? [selectedTrainingJob.trainingJobName] : []}
                onFetchData={onFetchData}
                defaultPageIndex={pageIndex}
            />
        )    
    }

    return (
        <Stack>
            { selectedTrainingJob !== undefined && renderStopConfirmationDialog() }
            { selectedTrainingJob !== undefined && renderAttachConfirmationDialog() }
            { selectedTrainingJob !== undefined && renderDetachConfirmationDialog() }
            { renderTrainingJobList() }
        </Stack>
    )
}

export default TrainingJobList;