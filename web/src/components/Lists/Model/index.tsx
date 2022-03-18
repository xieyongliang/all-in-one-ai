import React, { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Container, Link, Stack, Toggle, Table, Button, Inline, ButtonDropdown } from 'aws-northstar';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';

interface ModelItem {
    modelName: string;
    creationTime: string;
}

const ModelList: FunctionComponent = () => {
    const [ modelItems, setModelItems ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_create_model?action=code'), axios.get('/function/all_in_one_ai_create_model?action=console')];
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

    useEffect(() => {
        axios.get('/model', {params : {'case': params.name}})
            .then((response) => {
                var items = []
                for(let item of response.data) {
                    items.push({modelName: item.ModelName, creationTime: item.CreationTime})
                    if(items.length === response.data.length)
                        setModelItems(items)
                }
                setLoading(false);
            }, (error) => {
                console.log(error);
            });
        }, [params.name]);

    const getRowId = React.useCallback(data => data.modelName, []);

    const onCreate = () => {
        history.push(`/case/${params.name}?tab=model#form`)
    }

    const columnDefinitions : Column<ModelItem>[]= [
        {
            id: 'modelName',
            width: 400,
            Header: 'Name',
            accessor: 'modelName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=model#prop:id=${row.original.modelName}`}> {row.original.modelName} </a>;
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 400,
            Header: 'Creation time',
            accessor: 'creationTime'
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
                items={modelItems}
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