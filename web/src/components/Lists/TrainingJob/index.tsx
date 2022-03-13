import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Column } from 'react-table'
import { Button, ButtonDropdown, StatusIndicator, Table, Toggle, Link } from 'aws-northstar/components';
import { Container, Inline, Stack }  from 'aws-northstar/layouts';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getDurationBySeconds, getUtcDate } from '../../Utils/Helper/index';

interface TrainingJobItem {
    trainingJobName: string;
    creationTime: string;
    duration: string;
    trainingJobStatus?: string;
}

const TrainingJobList: FunctionComponent = () => {
    const [ items ] = useState([])
    const [ loading, setLoading ] = useState(true);
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
        const request1 = axios.get('/trainingjob', {params : {'case': params.name}})
        const request2 = axios.get('/function/all_in_one_ai_create_training_job_yolov5?action=code');
        const request3 = axios.get('/function/all_in_one_ai_create_training_job_yolov5?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            if(cancel) return;
            for(let item of response1.data) {
                items.push({trainingJobName: item.TrainingJobName, trainingJobStatus : item.TrainingJobStatus, duration: getDurationBySeconds(parseInt(item.TrainingTimeInSeconds)), creationTime: getUtcDate(item.CreationTime)})
            }
            setLoading(false);
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


    const onCreate = () => {
        history.push(`/case/${params.name}?tab=trainingjob#form`)
    }
    
    const getRowId = React.useCallback(data => data.trainingJobName, []);

    const columnDefinitions : Column<TrainingJobItem>[]= [
        {
            id: 'trainingJobName',
            width: 500,
            Header: 'Name',
            accessor: 'trainingJobName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=trainingjob#prop:id=${row.original.trainingJobName}`}> {row.original.trainingJobName} </a>;
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
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Clone' }, { text: 'Create model' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
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
                items={items}
                loading={loading}
                onSelectionChange={console.log}
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
            {renderTrainingJobList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default TrainingJobList;