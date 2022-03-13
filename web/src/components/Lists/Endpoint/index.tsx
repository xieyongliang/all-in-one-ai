
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Container, Link, Stack, Toggle, Button, ButtonDropdown, StatusIndicator, Table } from 'aws-northstar';
import Inline from 'aws-northstar/layouts/Inline';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getUtcDate } from '../../Utils/Helper/index';

interface EndpointItem {
    endpointName: string;
    endpointStatus: string;
    creationTime: string;
    lastModifiedTime: string;
}

const EndpointList: FunctionComponent = () => {
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
        const request1 = axios.get('/endpoint', {params : {'case': params.name}})
        const request2 = axios.get('/function/all_in_one_ai_create_endpoint?action=code');
        const request3 = axios.get('/function/all_in_one_ai_create_endpoint?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            for(let item of response1.data) {
                items.push({endpointName: item.EndpointName, endpointStatus: item.EndpointStatus, creationTime: getUtcDate(item.CreationTime), lastModifiedTime: getUtcDate(item.LastModifiedTime)})
            }
            setLoading(false);
            getSourceCode(response2.data).then((data) => {
                if(cancel) return;
                var zip = new JSZip();
                zip.loadAsync(data).then(async function(zipped) {
                    zipped.file('lambda_function.py').async('string').then(function(data) {
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
        history.push('/case/' + params.name + '?tab=endpoint#form')
    }
    
    const getRowId = React.useCallback(data => data.endpointName, []);

    const columnDefinitions : Column<EndpointItem>[]= [
        {
            id: 'endpointName',
            width: 400,
            Header: 'Name',
            accessor: 'endpointName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=endpoint#prop:id=${row.original.endpointName}`}> {row.original.endpointName} </a>;
                }
                return null;
            }
        },
        {
            id: 'endpointStatus',
            width: 200,
            Header: 'Status',
            accessor: 'endpointStatus',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.endpointStatus;
                    switch(status) {
                        case 'InService':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'OutOfService':
                        case 'Failed':
                        case 'RollingBack':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'Creating':
                        case 'Updating':
                        case 'SystemUpdating':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        case 'Deleting':
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
            accessor: 'creationTime'
        },
        {
            id: 'lastModifiedTime',
            width: 250,
            Header: 'Last updated',
            accessor: 'lastModifiedTime'
        }
    ];
    
    const tableActions = (
        <Inline>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Clone' }, { text: 'Create rest api' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );

    const renderEndpointList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Endpoints'
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
            {renderEndpointList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default EndpointList;