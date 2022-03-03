import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Container, Link, Stack, Toggle, Table, Button, Inline, ButtonDropdown } from 'aws-northstar';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';

interface ModelItem {
    name: string;
    creation_time: string;
}

const ModelList: FunctionComponent = () => {
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
        const request1 = axios.get('/model', {params : {'case': params.name}})
        const request2 = axios.get('/function/all_in_one_ai_create_model?action=code');
        const request3 = axios.get('/function/all_in_one_ai_create_model?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            for(let item of response1.data) {
                items.push({name: item.model_name, creation_time: item.creation_time})
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

    const getRowId = React.useCallback(data => data.name, []);

    const onCreate = () => {
        history.push(`/case/${params.name}?tab=model#form`)
    }

    const columnDefinitions : Column<ModelItem>[]= [
        {
            id: 'name',
            width: 400,
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=model#prop:id=${row.original.name}`}> {row.original.name} </a>;
                }
                return null;
            }
        },
        {
            id: 'creation_time',
            width: 400,
            Header: 'Creation time',
            accessor: 'creation_time'
        }
    ];
    
    const tableActions = (
        <Inline>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Clone' }, { text: 'Create endpoint' }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    const renderModelList = () => {
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
            {renderModelList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default ModelList;