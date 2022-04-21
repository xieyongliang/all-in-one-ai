import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Column } from 'react-table'
import { Button, ButtonDropdown, StatusIndicator, Table, Toggle, Link, Text } from 'aws-northstar/components';
import { Container, Inline, Stack }  from 'aws-northstar/layouts';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getDurationBySeconds, getUtcDate } from '../../Utils/Helper/index';
import { DeleteConfirmationDialog } from 'aws-northstar';
import { FetchDataOptions } from 'aws-northstar/components/Table';

interface TrainingJobItem {
    trainingJobName: string;
    creationTime: string;
    duration: string;
    trainingJobStatus?: string;
}

const TrainingJobList: FunctionComponent = () => {
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
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
    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_create_training_job?action=code'), axios.get('/function/all_in_one_ai_create_training_job?action=console')];
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
            }
        );
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);


    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=trainingjob#form`)
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
                title={`Delete ${selectedTrainingJob.trainingJobName}`}
                onCancelClicked={() => setVisibleStopConfirmation(false)}
                onDeleteClicked={stopTrainingJob}
                loading={processingStop}
                deleteButtonText='Stop'
            >
                <Text>This will permanently stop your training job and cannot be undone. This may affect other resources.</Text>
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
                alert('Error occured, please check and try it again');
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
                title={`Attach ${selectedTrainingJob.trainingJobName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachTrainingJob}
                loading={processingAttach}
                deleteButtonText='Attach'
            >
                <Text>This will attach this training job to current industrial model.</Text>
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
                title={`Detach ${selectedTrainingJob.trainingJobName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachTrainingJob}
                loading={processingDetach}
                deleteButtonText='Detach'
            >
                <Text>This will dettach this training job from current industrial model.</Text>
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
                alert('Error occured, please check and try it again');
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
            Header: 'Name',
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
            id: 'trainingJobStatus',
            width: 200,
            Header: 'Status',
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
            <Toggle label='Show all' checked={showAll} onChange={onChangeShowAll}/>
            <Button icon="refresh" onClick={onRefresh} loading={loading}>Refresh</Button>
            <ButtonDropdown
                content='Actions'
                    items={[{ text: 'Stop', onClick: onStop, disabled: disabledStop }, { text: 'Attach', onClick: onAttach, disabled: disabledAttach }, { text: 'Detach', onClick: onDetach, disabled: disabledDetach }, { text: 'Add/Edit tags', disabled: true }]}
            />        
            <Button variant='primary' onClick={onCreate}>Create</Button>
        </Inline>
    );

    const onSelectionChange = (selectedItems: TrainingJobItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedTrainingJob(selectedItems[0])
            setDisabledStop(false)
            if(!showAll) {
                setDisabledAttach(true)
                setDisabledDetach(false)
            }
            else {
                var index = trainingJobCurItems.findIndex((item) => item.trainingJobName === selectedItems[0].trainingJobName)
                setDisabledAttach(index >= 0)
                setDisabledDetach(index < 0) 
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
                tableTitle='Training jobs'
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

    return (
        <Stack>
            { selectedTrainingJob !== undefined && renderStopConfirmationDialog() }
            { selectedTrainingJob !== undefined && renderAttachConfirmationDialog() }
            { selectedTrainingJob !== undefined && renderDetachConfirmationDialog() }
            {renderTrainingJobList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default TrainingJobList;