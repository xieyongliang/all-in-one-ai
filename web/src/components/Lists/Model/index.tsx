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
    const [ selectedModel, setSelectedModel ] = useState<ModelItem>()
    const [ showAll, setShowAll ] = useState(false)
    const [ visibleDeleteConfirmation, setVisibleDeleteConfirmation ] = useState(false);
    const [ processingDelete, setProcessingDelete ] = useState(false);
    const [ disabledDelete, setDisabledDelete ] = useState(true)
    const [ visibleAttachConfirmation, setVisibleAttachConfirmation ] = useState(false)
    const [ processingAttach, setProcessingAttach ] = useState(false);
    const [ disabledAttach, setDisabledAttach ] = useState(true)
    const [ visibleDetachConfirmation, setVisibleDetachConfirmation ] = useState(false)
    const [ processingDetach, setProcessingDetach ] = useState(false);
    const [ disabledDetach, setDisabledDetach ] = useState(true)    

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
        var request = showAll ? axios.get('/model', {params : {'action': 'list'}}) : axios.get('/model', {params : {'industrial_model': params.id}})
        request.then(
            (response) => {
                var items = []
                for(let item of response.data) {
                    items.push({modelName: item.ModelName, creationTime: getUtcDate(item.CreationTime)})
                    if(items.length === response.data.length)
                        setModelItems(items)
                }
                setLoading(false);
            }, (error) => {
                console.log(error);
            }
        );
    }, [params.id, showAll])
    
    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const getRowId = useCallback(data => data.modelName, []);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=model#form`)
    }

    const onDelete = () => {
        setVisibleDeleteConfirmation(true)
    }

    const onAttach = () => {
        setVisibleAttachConfirmation(true)
    }

    const onDetach = () => {
        setVisibleDetachConfirmation(true)
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
            <Toggle label='Show all' checked={showAll} onChange={(checked)=>setShowAll(checked)}/>
            <Button icon="refresh" onClick={onRefresh} loading={loading}>Refresh</Button>
            <ButtonDropdown
                content='Actions'
                    items={[{ text: 'Delete', onClick: onDelete, disabled: disabledDelete }, { text: 'Attach', onClick: onAttach, disabled: disabledAttach }, { text: 'Detach', onClick: onDetach, disabled: disabledDetach }, { text: 'Add/Edit tags', disabled: true }]}
                />        
            <Button variant='primary' onClick={onCreate}>Create</Button>
        </Inline>
    );

    const renderDeleteConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleDeleteConfirmation}
                title={`Delete ${selectedModel.modelName}`}
                onCancelClicked={() => setVisibleDeleteConfirmation(false)}
                onDeleteClicked={deleteModel}
                loading={processingDelete}
            >
                <Text>This will permanently delete your model and cannot be undone. This may affect other resources.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const deleteModel = () => {
        setProcessingDelete(true)
        axios.delete(`/model/${selectedModel.modelName}`).then((data) => {
            setModelItems(modelItems.filter((item) => item.modelName !== selectedModel.modelName));
            setVisibleDeleteConfirmation(false);
            setProcessingDelete(false);
        }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingDelete(false);
            }
        )
    }

    const renderAttachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleAttachConfirmation}
                title={`Attach ${selectedModel.modelName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachModel}
                loading={processingAttach}
                deleteButtonText='Attach'
            >
                <Text>This will attach this model to current industrial model.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const attachModel = () => {
        setProcessingAttach(true)
        axios.get(`/model/${selectedModel.modelName}`, {params: {industrial_model: params.id, action: 'attach'}}).then((data) => {
            onRefresh();
            setVisibleAttachConfirmation(false);
            setProcessingAttach(false);
        }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingAttach(false)
            }        
        )
    }

    const renderDetachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleDetachConfirmation}
                title={`Detach ${selectedModel.modelName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachModel}
                loading={processingDetach}
                deleteButtonText='Detach'
            >
                <Text>This will dettach this model from current industrial model.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const detachModel = () => {
        setProcessingDetach(true)
        axios.get(`/model/${selectedModel.modelName}`, {params: {industrial_model: params.id, action: 'detach'}}).then((data) => {
            onRefresh();
            setVisibleDetachConfirmation(false);
            setProcessingDetach(false);
        }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingDetach(false);
            }        
        )
    }
    
    const onSelectionChange = (selectedItems: ModelItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedModel(selectedItems[0])
            setDisabledDelete(false)
            var index = modelItems.findIndex((item) => item.name === selectedItems[0].modelName)
            setDisabledAttach(index < 0)
            setDisabledDetach(index >= 0)
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
                selectedRowIds={selectedModel !== undefined ? [selectedModel.modelName] : []}
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
            { selectedModel  !== undefined && renderAttachConfirmationDialog() }
            { selectedModel  !== undefined && renderDetachConfirmationDialog() }
            { renderModelList() }
            { renderSampleCode() }
        </Stack>
    )
}

export default ModelList;