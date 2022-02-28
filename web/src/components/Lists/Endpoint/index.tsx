
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

interface DataType {
    name: string;
    model: string;
    creation_time: string;
    status: string;
    last_updated: string;
}

const EndpointList: FunctionComponent = () => {
    const [ items, setItems ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)

    const casename = useRef('');
    
    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        const request1 = axios.get('/endpoint', {params : {'case': params.name}})
        const request2 = axios.get('/helper/function/all_in_one_ai_create_endpoint?action=code');
        const request3 = axios.get('/helper/function/all_in_one_ai_create_endpoint?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            var items = []
            for(let item of response1.data) {
                items.push({name: item.endpoint_name, model: item.model_name, creation_time: item.creation_time, status : item.endpoint_status, last_updated: item.last_modified_time})
            }
            setItems(items);
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
    },[params.name]);

    const onCreate = () => {
        history.push('/case/' + params.name + '?tab=endpoint#form')
    }
    
    const getRowId = React.useCallback(data => data.name, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'name',
            width: 100,
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=endpoint#prop:id=${row.original.name}`}> {row.original.name} </a>;
                }
                return null;
            }
        },
        {
            id: 'model',
            width: 400,
            Header: 'Container image',
            accessor: 'model'
        },
        {
            id: 'creation_time',
            width: 200,
            Header: 'Creation time',
            accessor: 'creation_time'
        },
        {
            id: 'status',
            width: 400,
            Header: 'Model artificate',
            accessor: 'status',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.status;
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
            id: 'last_update',
            width: 400,
            Header: 'Last updated',
            accessor: 'last_updated'
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

    const renderEndpointList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Models'
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
            {renderEndpointList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default EndpointList;