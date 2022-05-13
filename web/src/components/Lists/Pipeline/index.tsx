import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import {Column} from 'react-table'
import { Link, useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { getUtcDate } from '../../Utils/Helper';
import { Container, Stack, Toggle } from 'aws-northstar';
import './index.scss'

interface PipelineItem {
    pipelineExecutionArn: string;
    pipelineName: string;
    pipelineExecutionStatus: string;
    creationTime: string;
    lastModifiedTime: string;
}

const PipelineList: FunctionComponent = () => {
    const [ pipelineItems, setPipelineItems ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_create_pipeline?action=code'), axios.get('/function/all_in_one_ai_create_pipeline?action=console')];
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
        axios.get('/pipeline', {params : {'industrial_model': params.id}})
            .then((response) => {
            var items = []
            if(response.data.length === 0) {
                setPipelineItems(items);
                setLoading(false);
            }
            else 
                for(let item of response.data) {
                    items.push({pipelineExecutionArn : item.PipelineExecutionArn, pipelineName: item.PipelineExperimentConfig['ExperimentName'], pipelineExecutionStatus: item.PipelineExecutionStatus, creationTime: item.CreationTime, lastModifiedTime: item.LastModifiedTime})
                    if(items.length === response.data.length) {
                        setPipelineItems(items);
                        setLoading(false);
                    }
                }
        }, (error) => {
            console.log(error);
            setLoading(false);
        });
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=pipeline#create`)
    }

    const getRowId = useCallback(data => data.pipelineExecutionArn, []);

    const columnDefinitions : Column<PipelineItem>[]= [
        {
            id: 'pipelineExecutionArn',
            width: 700,
            Header: 'Execution arn',
            accessor: 'pipelineExecutionArn',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=pipeline#prop:id=${row.original.pipelineExecutionArn}`}> {row.original.pipelineExecutionArn} </a>;
                }
                return null;
            }        
        },
        {
            id: 'pipelineName',
            width: 150,
            Header: 'Name',
            accessor: 'pipelineName'
        },
        {
            id: 'pipelineExecutionStatus',
            width: 150,
            Header: 'Status',
            accessor: 'pipelineExecutionStatus',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.pipelineExecutionStatus;
                    switch(status) {
                        case 'Succeeded':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'Failed':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'Executing':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        case 'Stopping':
                        case 'Stopped':
                            return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 250,
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
            id: 'lastModifiedTime',
            width: 250,
            Header: 'Last updated',
            accessor: 'lastModifiedTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getUtcDate(row.original.lastModifiedTime)
                }
                return null;
            }
        }   
    ];
    
    const tableActions = (
        <Inline>
            <div className='tableaction'>
                <Button icon="refresh" onClick={onRefresh} loading={loading}>Refresh</Button>
            </div>
            <div className='tableaction'>
                <Button variant='primary' onClick={onCreate}>Create</Button>
            </div>
        </Inline>
    );

    const renderSampleCode = () => {
        return (
            <Container title = 'Sample code'>
                <Toggle label={visibleSampleCode ? 'Show sample code' : 'Hide sample code'} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <Link href={sampleConsole} to={''}>Open in AWS Lambda console</Link>
                {
                    visibleSampleCode && <SyntaxHighlighter language='python' style={github} showLineNumbers={true}>
                        {sampleCode}
                    </SyntaxHighlighter>
                }
            </Container>
        )
    }
        
    const renderPipelineList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Pipeline'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={pipelineItems}
                onSelectionChange={console.log}
                loading={loading}
                getRowId={getRowId}
            />
        )
    }

    return (
        <Stack>
            { renderPipelineList() }
            { renderSampleCode() }
        </Stack>
    )
}

export default PipelineList;