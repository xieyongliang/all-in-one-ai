
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Stack, Toggle, Button, ButtonDropdown, StatusIndicator, Table, Text } from 'aws-northstar';
import DeleteConfirmationDialog from '../../Utils/DeleteConfirmationDialog';
import Inline from 'aws-northstar/layouts/Inline';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getLocaleDate, logOutput } from '../../Utils/Helper/index';
import './index.scss'
import { useTranslation } from "react-i18next";
import EndpointASGForm from '../../Forms/Endpoint/asg';

interface EndpointItem {
    endpointName: string;
    endpointStatus: string;
    creationTime: string;
    lastModifiedTime: string;
}

const EndpointList: FunctionComponent = () => {
    const [ loading, setLoading ] = useState(true);
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<EndpointItem>();
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
    const [ endpointCurItems, setEndpointCurItems ] = useState([]);
    const [ endpointAllItems, setEndpointAllItems ] = useState([]);
    const [ disabledASG, setDisabledASG ] = useState(true)
    const [ visibleASG, setVisibleASG ] = useState(false)

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=endpoint#create`)
    }

    const onASG = () => {
        setVisibleASG(true)
    }

    const onClose = () => {
        setVisibleASG(false)
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

    const onRefreshCurItems = useCallback(() => {
        setLoading(true)
        var endpointCurItems = [];        
        axios.get('/endpoint', {params : {'industrial_model': params.id}})
            .then((response) => {
                if(response.data.length === 0) {
                    setEndpointCurItems(endpointCurItems);
                    setLoading(false);
                    setSelectedEndpoint(undefined);
                }
                for(let item of response.data) {
                    endpointCurItems.push(
                        {
                            endpointName: item.EndpointName, 
                            endpointStatus: item.EndpointStatus, 
                            creationTime: item.CreationTime, 
                            lastModifiedTime: item.LastModifiedTime
                        }
                    )
                    if(endpointCurItems.length === response.data.length) {
                        setEndpointCurItems(endpointCurItems);
                        setLoading(false);
                        setSelectedEndpoint(undefined);
                    }
                }
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                setLoading(false);
            }
        );
    }, [params.id])

    const onRefreshAllItems = useCallback(() => {
        var endpointAllItems = [];
        setLoading(true);
        axios.get('/endpoint', {params : {'action': 'list'}})
            .then((response) => {
                if(response.data.length === 0) {
                    setEndpointAllItems(endpointAllItems);
                    setLoading(false);
                    setSelectedEndpoint(undefined);
                }
                for(let item of response.data) {
                    endpointAllItems.push(
                        {
                            endpointName: item.EndpointName,
                            endpointStatus: item.EndpointStatus,
                            creationTime: item.CreationTime,
                            lastModifiedTime: item.LastModifiedTime
                        }
                    )
                    if(endpointAllItems.length === response.data.length) {
                        setEndpointAllItems(endpointAllItems);
                        setLoading(false);
                        setSelectedEndpoint(undefined);
                    }
                }
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                setLoading(false);
            }
        );
    }, [])

    useEffect(() => {
        onRefreshCurItems()
    }, [onRefreshCurItems]);

    const getRowId = useCallback(data => data.endpointName, []);

    const columnDefinitions : Column<EndpointItem>[]= [
        {
            id: 'endpointName',
            width: 400,
            Header: t('industrial_models.common.name'),
            accessor: 'endpointName',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=endpoint#prop:id=${row.original.endpointName}`}> {row.original.endpointName} </a>;
                }
                return null;
            }
        },
        {
            id: 'endpointStatus',
            width: 200,
            Header: t('industrial_models.common.status'),
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
            Header: t('industrial_models.common.creation_time'),
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getLocaleDate(row.original.creationTime)
                }
                return null;
            }
        },
        {
            id: 'lastModifiedTime',
            width: 250,
            Header: t('industrial_models.common.last_modified_time'),
            accessor: 'lastModifiedTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getLocaleDate(row.original.lastModifiedTime)
                }
                return null;
            }
        }
    ];

    const onChangeShowAll = (checked) => {
        setShowAll(checked);
        if(checked)
            onRefreshAllItems();
        
        if(!checked && selectedEndpoint !==undefined && endpointCurItems.findIndex((item) => item.endpointName === selectedEndpoint.endpointName) < 0)
            setSelectedEndpoint(undefined);
    }

    const tableActions = (
        <Inline>
            <div className='tableaction'>
                <Toggle label={t('industrial_models.common.show_all')} checked={showAll} onChange={onChangeShowAll}/>
            </div>
            <div className='tableaction'>
                <Button icon="refresh" onClick={() => {if(showAll) onRefreshAllItems(); else onRefreshCurItems();}} loading={loading}>{t('industrial_models.common.refresh')}</Button>
            </div>
            <div className='tableaction'>
                <ButtonDropdown
                    content={t('industrial_models.common.actions')}
                        items={[{ text: t('industrial_models.common.delete'), onClick: onDelete, disabled: disabledDelete }, { text: t('industrial_models.common.attach'), onClick: onAttach, disabled: disabledAttach }, { text: t('industrial_models.common.detach'), onClick: onDetach, disabled: disabledDetach }, { text: t('industrial_models.common.add_or_edit_tags'), disabled: true }, { text: t('industrial_models.endpoint.asg_settings'), onClick: onASG, disabled: disabledASG }]}
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
                title={t('industrial_models.common.delete') + ` ${selectedEndpoint.endpointName}`}
                onCancelClicked={() => setVisibleDeleteConfirmation(false)}
                onDeleteClicked={deleteEndpoint}
                loading={processingDelete}
                deleteButtonText={t('industrial_models.common.delete')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.endpoint.delete_endpoint')}</Text>
            </DeleteConfirmationDialog>
        )
    }

    const deleteEndpoint = () => {
        setProcessingDelete(true)
        axios.delete(`/endpoint/${selectedEndpoint.endpointName}`, {params: {industrial_model: params.id}}).then((data) => {
            onRefreshCurItems();
            if(showAll)
                onRefreshAllItems();
            
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
                title={t('industrial_models.common.attach') + ` ${selectedEndpoint.endpointName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachEndpoint}
                loading={processingAttach}
                deleteButtonText={t('industrial_models.common.attach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.endpoint.attach_endpoint')}</Text>
            </DeleteConfirmationDialog>
        )
    }

    const attachEndpoint = () => {
        setProcessingAttach(true)
        axios.get(`/endpoint/${selectedEndpoint.endpointName}`, {params: {industrial_model: params.id, action: 'attach'}}).then((data) => {
            onRefreshCurItems();
            if(showAll)
                onRefreshAllItems();
            
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
                title={t('industrial_models.common.detach') + ` ${selectedEndpoint.endpointName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachEndpoint}
                loading={processingDetach}
                deleteButtonText={t('industrial_models.common.detach')}
                cancelButtonText={t('industrial_models.common.cancel')}
            >
                <Text>{t('industrial_models.endpoint.detach_endpoint')}</Text>
            </DeleteConfirmationDialog>
        )
    }

    const detachEndpoint = () => {
        setProcessingDetach(true)
        axios.get(`/endpoint/${selectedEndpoint.endpointName}`, {params: {industrial_model: params.id, action: 'detach'}}).then((data) => {
            onRefreshCurItems();
            if(showAll)
                onRefreshAllItems();
            
            setVisibleDetachConfirmation(false);
            setProcessingDetach(false);
        }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                setProcessingDetach(false);
            }        
        )
    }    

    const onSelectionChange = (selectedItems: EndpointItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedEndpoint(selectedItems[0])
            setDisabledDelete(false)
            setDisabledASG(false)

            var endpointCurItem = endpointCurItems.find((item) => item.endpointName === selectedItems[0].endpointName)

            if(!showAll) {
                setDisabledAttach(true)
                setDisabledDetach(false)
            }
            else {
                setDisabledAttach(endpointCurItem !== undefined)
                setDisabledDetach(endpointCurItem === undefined) 
            }
        }
    }

    const renderEndpointList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle={t('industrial_models.endpoints')}
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={showAll ? endpointAllItems : endpointCurItems}
                loading={loading}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
                selectedRowIds={selectedEndpoint !== undefined ? [selectedEndpoint.endpointName] : []}
            />
        )
    }
    
    const renderASGForm = () => {
        return <EndpointASGForm endpointName={selectedEndpoint.endpointName} onClose={onClose}/>;
    }

    return (
        <Stack>
            { visibleASG && renderASGForm() }
            { !visibleASG && selectedEndpoint !== undefined && renderDeleteConfirmationDialog() }
            { !visibleASG && selectedEndpoint !== undefined && renderAttachConfirmationDialog() }
            { !visibleASG && selectedEndpoint !== undefined && renderDetachConfirmationDialog() }
            { !visibleASG && renderEndpointList() }
        </Stack>
    )
}

export default EndpointList;