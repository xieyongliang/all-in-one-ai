import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Column } from 'react-table'
import { Container, Stack, Inline } from 'aws-northstar';
import { Table, Button, ButtonDropdown, Toggle, Link } from 'aws-northstar/components';
import { PathParams } from '../../Interfaces/PathParams';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';

interface DataType {
    name: string;
    version: string;
    arn: string;
}

const GreengrassComponentList: FunctionComponent = () => {
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
        var component_name = 'com.example.yolov5'
        const request1 = axios.get(`/greengrass/component/${component_name}`, {params : {'case': params.name}})
        const request2 = axios.get('/function/all_in_one_ai_greengrass_create_component_version?action=code');
        const request3 = axios.get('/function/all_in_one_ai_greengrass_create_component_version?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            for(let item of response1.data) {
                items.push({name: item.component_name, version: item.component_version, arn : item.component_version_arn})
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
        history.push('/case/' + params.name + '?tab=greengrasscomponent#form')
    }

    const getRowId = React.useCallback(data => data.arn, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'name',
            width: 200,
            Header: 'Component name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=greengrasscomponent#prop:id=${row.original.arn}`}> {row.original.name} </a>;
                }
                return null;
            }
        },
        {
            id: 'version',
            width: 200,
            Header: 'Component version',
            accessor: 'version'
        },
        {
            id: 'arn',
            width: 200,
            Header: 'Component version arn',
            accessor: 'arn'
        }
    ];
    
    const tableActions = (
        <Inline>
            <ButtonDropdown
                content="Action"
                    items={[{ text: 'Clone' }, { text: 'Create endpoint' }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );    

    const renderGreengrassComponentlList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Greengrass components'
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
            {renderGreengrassComponentlList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default GreengrassComponentList;