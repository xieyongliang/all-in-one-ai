import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Container, Link, Stack, Toggle, Table, Button, Inline, ButtonDropdown, Text, DeleteConfirmationDialog } from 'aws-northstar';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getUtcDate } from '../../Utils/Helper';

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
    const [ deleteConfirmationDialogVisible, setDeleteConfirmationDialogVisiable ] = useState(false);
    const [ isDeleteProcessing, setIsDeleteProcessing ] = useState(false);
    const [ selectedModel, setSelectedModel ] = useState<ModelItem>()
    const [ deleteDisabled, setDeleteDisabled ] = useState(true)

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

    const onRefresh = useCallback(() => {
        setLoading(true)
        axios.get('/model', {params : {'industrial_model': params.id}})
            .then((response) => {
                var items = []
                for(let item of response.data) {
                    items.push({modelName: item.ModelName, creationTime: getUtcDate(item.CreationTime)})
                    if(items.length === response.data.length)
                        setModelItems(items)
                }
                setLoading(false);
            }, (error) => {
                console.log(error);
            });
        }, [params.id])
    
    useEffect(() => {
        axios.get('/model', {params : {'industrial_model': params.id}})
            .then((response) => {
                var items = []
                for(let item of response.data) {
                    items.push({modelName: item.ModelName, creationTime: getUtcDate(item.CreationTime)})
                    if(items.length === response.data.length)
                        setModelItems(items)
                }
                setLoading(false);
            }, (error) => {
                console.log(error);
            });
        }, [params.id]);

    const getRowId = useCallback(data => data.modelName, []);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=model#form`)
    }

    const onDelete = () => {
        setDeleteConfirmationDialogVisiable(true)
    }

    const columnDefinitions : Column<ModelItem>[]= [
        {
            id: 'modelName',
            width: 400,
            Header: 'Name',
            accessor: 'modelName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=model#prop:id=${row.original.modelName}`}> {row.original.modelName} </a>;
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
            <Button variant="icon" icon="refresh" size="small" onClick={onRefresh}/>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Delete', onClick: onDelete, disabled: deleteDisabled }, { text: 'Add/Edit tags', disabled: true }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    const renderDeleteConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={deleteConfirmationDialogVisible}
                title={`Delete ${selectedModel.modelName}`}
                onCancelClicked={() => setDeleteConfirmationDialogVisiable(false)}
                onDeleteClicked={deleteModel}
                loading={isDeleteProcessing}
            >
                <Text>This will permanently delete your model and cannot be undone. This may affect other resources.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const deleteModel = () => {
        setIsDeleteProcessing(true)
        axios.delete(`/model/${selectedModel.modelName}`, {params: {industrial_model: params.id}}).then((data) => {
            setModelItems(modelItems.filter((item) => item.modelName !== selectedModel.modelName))
            setDeleteConfirmationDialogVisiable(false)
            setIsDeleteProcessing(false)
        })
    }

    const onSelectionChange = (selectedItems: ModelItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedModel(selectedItems[0])
            setDeleteDisabled(false)
        }
    }

    const renderModelList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Models'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={modelItems}
                loading={loading}
                onSelectionChange={onSelectionChange}
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
            { selectedModel  !== undefined && renderDeleteConfirmationDialog() }
            { renderModelList() }
            { renderSampleCode() }
        </Stack>
    )
}

export default ModelList;