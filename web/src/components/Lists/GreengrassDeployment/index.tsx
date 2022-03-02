
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Container, Link, Stack, Toggle, Button, ButtonDropdown, StatusIndicator, Table} from 'aws-northstar';
import Inline from 'aws-northstar/layouts/Inline';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
import JSZip from 'jszip';
import { PathParams } from '../../Interfaces/PathParams';

interface DataType {
    target_arn: string;
    revision_id: string;
    deployment_id: string;
    deployment_created: string;
    status: string;
}

const GreengrassDeploymentList: FunctionComponent = () => {
    const [ items ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)

    const casename = useRef('');
    
    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        const request1 = axios.get(`/greengrass/deployment`, {params : {'case': params.name}})
        const request2 = axios.get('/function/all_in_one_ai_greengrass_create_deployment?action=code');
        const request3 = axios.get('/function/all_in_one_ai_greengrass_create_deployment?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            for(let item of response1.data) {
                items.push({target_arn: item.targetArn, revision_id: item.revisionId, deployment_id : item.deploymentId, deployment_created: item.creationTimestamp, status: item.deploymentStatus})
            }
            setLoading(false);
            axios.get('/file/download', {params: {uri: encodeURIComponent(response2.data)}, responseType: 'blob'})
            .then((response4) => {
                var zip = new JSZip();
                zip.loadAsync(response4.data).then(async function(zipped) {
                    zipped.file('lambda_function.py').async('string').then(function(data) {
                        setSampleCode(data)
                    })
                })
            });
            setSampleConsole(response3.data)
        }));
    },[params.name, items]);

    const onCreate = () => {
        history.push('/case/' + params.name + '?tab=greengrassdeployment#form')
    }

    const getRowId = React.useCallback(data => data.name, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'deployment_id',
            width: 200,
            Header: 'Deployment id',
            accessor: 'deployment_id',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=greengrassdeployment#prop:id=${row.original.deployment_id}`}> {row.original.deployment_id} </a>;
                }
                return null;
            }
        },
        {
            id: 'target_arn',
            width: 300,
            Header: 'Target arn',
            accessor: 'target_arn'
        },
        {
            id: 'revision_id',
            width: 200,
            Header: 'Revision id',
            accessor: 'revision_id'
        },
        {
            id: 'status',
            width: 100,
            Header: 'status',
            accessor: 'status',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.status;
                    switch(status) {
                        case 'ACTIVE':
                        case 'COMPLETED':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'FAILED':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'CANCELED':
                            return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
                        case 'INACTIVE':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        },
        {
            id: 'deployment_created',
            width: 200,
            Header: 'Deployment created',
            accessor: 'deployment_created'
        }
    ];
    
    const tableActions = (
        <Inline>
            <ButtonDropdown
                content="Action"
                    items={[{ text: 'Clone' }, { text: 'Create rest api' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    const renderGreengrassDeploymentlList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Greengrass deployments'
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
            <Container title = "Sample code">
                <Toggle label={visibleSampleCode ? "Show sample code" : "Hide sample code"} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <Link href={sampleConsole}>Open in AWS Lambda console</Link>
                {
                    visibleSampleCode && <SyntaxHighlighter language="python" style={github} showLineNumbers={true}>
                        {sampleCode}
                    </SyntaxHighlighter>
                }
            </Container>
        )
    }

    return (
        <Stack>
            {renderGreengrassDeploymentlList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default GreengrassDeploymentList;