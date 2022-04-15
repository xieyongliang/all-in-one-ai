
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
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
    const [ greengrassDeploymentItems, setGreengrassDeploymentItems ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    
    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    const onRefresh = useCallback(() => {
        setLoading(true)
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_greengrass_create_deployment?action=code'), axios.get('/function/all_in_one_ai_create_deployment?action=console')];
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
    }, [])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    useEffect(() => {
        setLoading(true)
        axios.get(`/greengrass/deployment`, {params : {'industrial_model': params.id}})
        .then((response) => {
            var items = []
            if(response.data.length === 0) {
                setGreengrassDeploymentItems(items);
                setLoading(false);
            }
            else
                for(let item of response.data) {
                    items.push({target_arn: item.targetArn, revision_id: item.revisionId, deployment_id : item.deploymentId, deployment_created: item.creationTimestamp, status: item.deploymentStatus})
                    if(items.length === response.data.length) {
                        setGreengrassDeploymentItems(items);
                        setLoading(false);
                    }
                }
        }, (error) => {
            console.log(error);
        });
    }, [params.id]);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=greengrassdeployment#form`)
    }

    const getRowId = useCallback(data => data.name, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'deployment_id',
            width: 400,
            Header: 'Deployment id',
            accessor: 'deployment_id',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodes/${params.id}?tab=greengrassdeployment#prop:id=${row.original.deployment_id}`}> {row.original.deployment_id} </a>;
                }
                return null;
            }
        },
        {
            id: 'target_arn',
            width: 550,
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
            width: 250,
            Header: 'Deployment created',
            accessor: 'deployment_created'
        }
    ];
    
    const tableActions = (
        <Inline>
            <Button icon="refresh" onClick={onRefresh} loading={loading}>Refresh</Button>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Clone' }, { text: 'Create rest api' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>Create</Button>
        </Inline>
    );
    
    const renderGreengrassDeploymentlList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Greengrass deployments'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={greengrassDeploymentItems}
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
            {renderGreengrassDeploymentlList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default GreengrassDeploymentList;