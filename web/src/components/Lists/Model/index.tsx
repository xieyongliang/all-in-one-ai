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
import { FetchDataOptions } from 'aws-northstar/components/Table';
import './index.scss'

interface ModelItem {
    modelName: string;
    creationTime: string;
}

const ModelList: FunctionComponent = () => {
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
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ modelCurItems, setModelCurItems ] = useState([])
    const [ modelAllItems, setModelAllItems ] = useState([])

    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
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

        var loadedAllItems = false;
        var loadedCurItems = false;
        var modelAllItems = [];
        var modelCurItems = [];
        
        axios.get('/model', {params : {'action': 'list'}})
            .then((response) => {
                if(response.data.length === 0) {
                    loadedAllItems = true;
                    setModelAllItems(modelAllItems);
                    if(loadedCurItems) {
                        setLoading(false);
                        setSelectedModel(undefined);
                    }
                }
                for(let item of response.data) {
                    modelAllItems.push({modelName: item.ModelName, creationTime: item.CreationTime})
                    if(modelAllItems.length === response.data.length) {
                        loadedAllItems = true;
                        setModelAllItems(modelAllItems);
                        if(loadedCurItems) {
                            setLoading(false);
                            setSelectedModel(undefined);
                        }
                    }
                }
            }, (error) => {
                console.log(error);
                setLoading(false)
            }
        );
        axios.get('/model', {params : {'industrial_model': params.id}})
            .then((response) => {
                if(response.data.length === 0) {
                    setModelCurItems(modelCurItems);
                    loadedCurItems = true;
                    if(loadedAllItems) {
                        setLoading(false);
                        setSelectedModel(undefined);
                    }
                }
                for(let item of response.data) {
                    modelCurItems.push({modelName: item.ModelName, creationTime: item.CreationTime})
                    if(modelCurItems.length === response.data.length) {
                        setModelCurItems(modelCurItems);
                        loadedCurItems = true;
                        if(loadedAllItems) {               
                            setLoading(false);
                            setSelectedModel(undefined);
                        }
                    }
                }
            }, (error) => {
                console.log(error);
                setLoading(false);
            }
        );
    }, [params.id])
    
    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const getRowId = useCallback(data => data.modelName, []);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=model#create`)
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

    const onDeploy = () => {
        history.push(`/imodels/${params.id}?tab=deploy#create`)
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
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getUtcDate(row.original.creationTime)
                }
                return null;
            }
        }
    ];

    const onChangeShowAll = (checked) => {
        setShowAll(checked);
        if(!checked && selectedModel !==undefined && modelCurItems.findIndex((item) => item.modelName === selectedModel.modelName) < 0)
            setSelectedModel(undefined);
    }

    const tableActions = (
        <Inline>
            <div className='tableaction'>
                <Toggle label='Show all' checked={showAll} onChange={onChangeShowAll}/>
            </div>
            <div className='tableaction'>
                <Button icon="refresh" onClick={onRefresh} loading={loading}>Refresh</Button>
            </div>
            <div className='tableaction'>
                <ButtonDropdown
                    content='Actions'
                    items={[{ text: 'Deploy', onClick: onDeploy}, { text: 'Delete', onClick: onDelete, disabled: disabledDelete }, { text: 'Attach', onClick: onAttach, disabled: disabledAttach }, { text: 'Detach', onClick: onDetach, disabled: disabledDetach }, { text: 'Add/Edit tags', disabled: true }]}
                />
            </div>
            <div className='tableaction'>
                <Button variant='primary' onClick={onCreate}>Create</Button>
            </div>
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
            setModelAllItems(modelAllItems.filter((item) => item.modelName !== selectedModel.modelName));
            setModelCurItems(modelCurItems.filter((item) => item.modelName !== selectedModel.modelName));
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
            if(!showAll) {
                setDisabledAttach(true)
                setDisabledDetach(false)
            }
            else {
                var index = modelCurItems.findIndex((item) => item.modelName === selectedItems[0].modelName)
                setDisabledAttach(index >= 0)
                setDisabledDetach(index < 0) 
            }
        }
    }

    const onFetchData = (options: FetchDataOptions) => {
        setPageIndex(options.pageIndex);
    }

    const renderModelList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Models'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={showAll ? modelAllItems : modelCurItems}
                loading={loading}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
                selectedRowIds={selectedModel !== undefined ? [selectedModel.modelName] : []}
                onFetchData={onFetchData}
                defaultPageIndex={pageIndex}
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