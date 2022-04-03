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

interface TrainingJobItem {
    trainingJobName: string;
    creationTime: string;
    duration: string;
    trainingJobStatus?: string;
}

const TrainingJobList: FunctionComponent = () => {
    const [ trainingJobItems, setTrainingJobItems ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ stopConfirmationDialogVisible, setStopConfirmationDialogVisiable ] = useState(false);
    const [ isStopProcessing, setIsStopProcessing ] = useState(false);
    const [ selectedTrainingJob, setSelectedTrainingJob ] = useState<TrainingJobItem>()
    const [ stopDisabled, setStopDisabled ] = useState(true)

    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_create_training_job_yolov5?action=code'), axios.get('/function/all_in_one_ai_create_training_job_yolov5?action=console')];
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
        axios.get('/trainingjob', {params : {'industrial_model': params.id}})
        .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({trainingJobName: item.TrainingJobName, trainingJobStatus : item.TrainingJobStatus, duration: getDurationBySeconds(parseInt(item.TrainingTimeInSeconds)), creationTime: getUtcDate(item.CreationTime)})
                if(items.length === response.data.length)
                    setTrainingJobItems(items)
            }
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);


    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=trainingjob#form`)
    }
    
    const onStop = () => {
        setStopConfirmationDialogVisiable(true)
    }

    const renderStopConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={stopConfirmationDialogVisible}
                title={`Delete ${selectedTrainingJob.trainingJobName}`}
                onCancelClicked={() => setStopConfirmationDialogVisiable(false)}
                onDeleteClicked={stopTrainingJob}
                loading={isStopProcessing}
            >
                <Text>This will permanently delete your model and cannot be undone. This may affect other resources.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const stopTrainingJob = () => {
        axios.get('/trainingjob', {params : {industrial_model: params.id, training_job_name: selectedTrainingJob, action: 'stop'}})
        .then((response) => {
            onRefresh()
            setStopConfirmationDialogVisiable(false)
            setIsStopProcessing(false)
        }, (error) => {
            console.log(error);
        });        
    }

    const onSelectionChange = (selectedItems: TrainingJobItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedTrainingJob(selectedItems[0])
            setStopDisabled(false)
        }
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
            accessor: 'creationTime'
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
    
    const tableActions = (
        <Inline>
            <Button variant="icon" icon="refresh" size="small" onClick={onRefresh}/>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Stop', onClick: onStop, disabled: stopDisabled }, { text: 'Add/Edit tags', disabled: true }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    const renderTrainingJobList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Training jobs'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={trainingJobItems}
                loading={loading}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
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
            {renderTrainingJobList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default TrainingJobList;