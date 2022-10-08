import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Stack, Toggle, Table, Button, Inline, ButtonDropdown, Text } from 'aws-northstar';
import DeleteConfirmationDialog from '../../Utils/DeleteConfirmationDialog';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getLocaleDate, logOutput } from '../../Utils/Helper';
import { FetchDataOptions } from 'aws-northstar/components/Table';
import './index.scss'
import { useTranslation } from "react-i18next";

interface ModelItem {
    modelName: string;
    creationTime: string;
}

const ModelList: FunctionComponent = () => {
    const [ loading, setLoading ] = useState(true);
    const [ selectedModel, setSelectedModel ] = useState<ModelItem>();
    const [ showAll, setShowAll ] = useState(false);
    const [ visibleDeleteConfirmation, setVisibleDeleteConfirmation ] = useState(false);
    const [ processingDelete, setProcessingDelete ] = useState(false);
    const [ disabledDelete, setDisabledDelete ] = useState(true);
    const [ visibleAttachConfirmation, setVisibleAttachConfirmation ] = useState(false);
    const [ processingAttach, setProcessingAttach ] = useState(false);
    const [ disabledAttach, setDisabledAttach ] = useState(true);
    const [ visibleDetachConfirmation, setVisibleDetachConfirmation ] = useState(false);
    const [ processingDetach, setProcessingDetach ] = useState(false);
    const [ disabledDetach, setDisabledDetach ] = useState(true);
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ modelCurItems, setModelCurItems ] = useState([]);
    const [ modelAllItems, setModelAllItems ] = useState([]);
    const [ items, setItems ] = useState([]);
    const [ lastOrderBy, setLastOrderBy ] = useState({});

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

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
                logOutput('error', error.response.data, undefined, error);
                setLoading(false);            
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
                        setItems(modelCurItems);
                        loadedCurItems = true;
                        if(loadedAllItems) {               
                            setLoading(false);
                            setSelectedModel(undefined);
                        }
                    }
                }
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
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

    const columnDefinitions : Column<ModelItem>[]= [
        {
            id: 'modelName',
            width: 400,
            Header: t('industrial_models.common.name'),
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
            Header: t('industrial_models.common.creation_time'),
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getLocaleDate(row.original.creationTime)
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
                <Toggle label={t('industrial_models.common.show_all')} checked={showAll} onChange={onChangeShowAll}/>
            </div>
            <div className='tableaction'>
                <Button icon="refresh" onClick={onRefresh} loading={loading}>{t('industrial_models.common.refresh')}</Button>
            </div>
            <div className='tableaction'>
                <ButtonDropdown
                    content={t('industrial_models.common.actions')}
                    items={[{ text: t('industrial_models.common.delete'), onClick: onDelete, disabled: disabledDelete }, { text: t('industrial_models.common.attach'), onClick: onAttach, disabled: disabledAttach }, { text: t('industrial_models.common.detach'), onClick: onDetach, disabled: disabledDetach }, { text: t('industrial_models.common.add_or_edit_tags'), disabled: true }]}
                />
            </div>
            <div className='tableaction'>
                <Button variant='primary' onClick={onCreate}>{t('industrial_models.common.create')}</Button>
            </div>
        </Inline>
    );

    const renderDeleteConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleDeleteConfirmation}
                title={t('industrial_models.common.delete') + ` ${selectedModel.modelName}`}
                onCancelClicked={() => setVisibleDeleteConfirmation(false)}
                onDeleteClicked={deleteModel}
                loading={processingDelete}
                deleteButtonText={t('industrial_models.common.delete')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.model.delete_model')}</Text>
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
                logOutput('error', error.response.data, undefined, error);
                setProcessingDelete(false);
            }
        )
    }

    const renderAttachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleAttachConfirmation}
                title={t('industrial_models.common.attach') + ` ${selectedModel.modelName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachModel}
                loading={processingAttach}
                deleteButtonText={t('industrial_models.common.attach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.model.attach_model')}</Text>
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
                logOutput('error', error.response.data, undefined, error);
                setProcessingAttach(false);
            }        
        )
    }

    const renderDetachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleDetachConfirmation}
                title={t('industrial_models.common.detach') + ` ${selectedModel.modelName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachModel}
                loading={processingDetach}
                deleteButtonText={t('industrial_models.common.detach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.model.detach_model')}</Text>
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
                logOutput('error', error.response.data, undefined, error);
                setProcessingDetach(false);
            }        
        )
    }
    
    const onSelectionChange = (selectedItems: ModelItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedModel(selectedItems[0])
            setDisabledDelete(false)

            var modelCurItem = modelCurItems.find((item) => item.modelName === selectedItems[0].modelName);

            if(!showAll) {
                setDisabledAttach(true)
                setDisabledDetach(false)
            }
            else {
                setDisabledAttach(modelCurItem !== undefined)
                setDisabledDetach(modelCurItem === undefined) 
            }
        }
    }

    const onFetchData = (options: FetchDataOptions) => {
        if(options.sortBy && options.sortBy.length > 0) {
            var sortBy = options.sortBy[0];

            if(sortBy['id'] !== lastOrderBy['id'] || sortBy['desc'] !== lastOrderBy['desc']) {
                var items = showAll ? modelAllItems : modelCurItems
                items.sort((a, b)=>{
                    var result = (a[sortBy.id] > b[sortBy.id] ? 1 : (a[sortBy.id] === b[sortBy.id] ?  0: -1)) * (sortBy.desc ? -1 : 1);
                    return result;
                })

                setItems(JSON.parse(JSON.stringify(items)));
                setPageIndex(options.pageIndex);      
                setLastOrderBy(sortBy);
            }
        }
    }

    const renderModelList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle={t('industrial_models.models')}
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={items}
                loading={loading}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
                selectedRowIds={selectedModel !== undefined ? [selectedModel.modelName] : []}
                onFetchData={onFetchData}
                defaultPageIndex={pageIndex}
            />
        )
    }

    return (
        <Stack>
            { selectedModel  !== undefined && renderDeleteConfirmationDialog() }
            { selectedModel  !== undefined && renderAttachConfirmationDialog() }
            { selectedModel  !== undefined && renderDetachConfirmationDialog() }
            { renderModelList() }
        </Stack>
    )
}

export default ModelList;