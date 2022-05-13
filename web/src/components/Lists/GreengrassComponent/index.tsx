import React, { FunctionComponent, useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Column } from 'react-table'
import { Container, Stack, Inline } from 'aws-northstar';
import { Table, Button, Toggle, Link } from 'aws-northstar/components';
import { PathParams } from '../../Interfaces/PathParams';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import './index.scss'

interface DataType {
    name: string;
    version: string;
    arn: string;
}

const GreengrassComponentList: FunctionComponent = () => {
    const [ greengrassComponentItems, setGreengrassComponentItems ] = useState([])
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

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_greengrass_create_component_version?action=code'), axios.get('/function/all_in_one_ai_create_component_version?action=console')];
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
        var component_name = 'com.example.yolov5'
        axios.get(`/greengrass/component/${component_name}`, {params : {'industrial_model': params.id}})
            .then((response) => {
                var items = []
                if(response.data.length === 0) {
                    setGreengrassComponentItems(items);
                    setLoading(false);
                }
                else
                    for(let item of response.data) {
                        items.push({name: item.component_name, version: item.component_version, arn : item.component_version_arn})
                        if(items.length === response.data.length) {
                            setGreengrassComponentItems(items);
                            setLoading(false);
                        }       
                    }
            }, (error) => {
                console.log(error);
            });
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=greengrasscomponentversion#create`)
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
                    return <a href={`/imodels/${params.id}?tab=greengrasscomponentversion#prop:id=${row.original.arn}`}> {row.original.name} </a>;
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
            <div className='tableaction'>
                <Button icon="refresh" onClick={onRefresh} loading={loading}>Refresh</Button>
            </div>
            <div className='tableaction'>
                <Button variant='primary' onClick={onCreate}>Create</Button>
            </div>
        </Inline>
    );    

    const renderGreengrassComponentlList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Greengrass components'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={greengrassComponentItems}
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
            {renderGreengrassComponentlList()}
            {renderSampleCode()}
        </Stack>
    )
}

export default GreengrassComponentList;