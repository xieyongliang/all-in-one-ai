
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {Column} from 'react-table'
import { Container, Link, Stack, Toggle, Button, ButtonDropdown, StatusIndicator, Table, Text, DeleteConfirmationDialog } from 'aws-northstar';
import Inline from 'aws-northstar/layouts/Inline';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getUtcDate } from '../../Utils/Helper/index';
import { FetchDataOptions } from 'aws-northstar/components/Table';
import './index.scss'

interface EndpointItem {
    endpointName: string;
    endpointStatus: string;
    creationTime: string;
    lastModifiedTime: string;
}

const EndpointList: FunctionComponent = () => {
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('');
    const [ sampleConsole, setSampleConsole ] = useState('');
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false);
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
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ endpointCurItems, setEndpointCurItems ] = useState([])
    const [ endpointAllItems, setEndpointAllItems ] = useState([])
    const history = useHistory();

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_create_endpoint?action=code'), axios.get('/function/all_in_one_ai_create_endpoint?action=console')];
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

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=endpoint#create`)
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

    const onRefresh = useCallback(() => {
        setLoading(true)

        var loadedAllItems = false;
        var loadedCurItems = false;
        var endpointAllItems = [];
        var endpointCurItems = [];
        
        axios.get('/endpoint', {params : {'action': 'list'}})
            .then((response) => {
                if(response.data.length === 0) {
                    loadedAllItems = true;
                    setEndpointAllItems(endpointAllItems);
                    if(loadedCurItems) {
                        setLoading(false);
                        setSelectedEndpoint(undefined);
                    }
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
                        loadedAllItems = true;
                        setEndpointAllItems(endpointAllItems);
                        if(loadedCurItems) {
                            setLoading(false);
                            setSelectedEndpoint(undefined);
                        }
                    }
                }
            }, (error) => {
                console.log(error);
                setLoading(false)
            }
        );
        axios.get('/endpoint', {params : {'industrial_model': params.id}})
            .then((response) => {
                if(response.data.length === 0) {
                    setEndpointCurItems(endpointCurItems);
                    loadedCurItems = true;
                    if(loadedAllItems) {
                        setLoading(false);
                        setSelectedEndpoint(undefined);
                    }
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
                        loadedCurItems = true;
                        if(loadedAllItems) {               
                            setLoading(false);
                            setSelectedEndpoint(undefined);
                        }
                    }
                }
            }, (error) => {
                console.log(error);
                setLoading(false)
            }
        );
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const getRowId = useCallback(data => data.endpointName, []);

    const columnDefinitions : Column<EndpointItem>[]= [
        {
            id: 'endpointName',
            width: 400,
            Header: 'Name',
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
            Header: 'Status',
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
            Header: 'Creation time',
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getUtcDate(row.original.creationTime)
                }
                return null;
            }
        },
        {
            id: 'lastModifiedTime',
            width: 250,
            Header: 'Last updated',
            accessor: 'lastModifiedTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getUtcDate(row.original.lastModifiedTime)
                }
                return null;
            }
        }
    ];

    const onChangeShowAll = (checked) => {
        setShowAll(checked);
        if(!checked && selectedEndpoint !==undefined && endpointCurItems.findIndex((item) => item.endpointName === selectedEndpoint.endpointName) < 0)
            setSelectedEndpoint(undefined);
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
                title={`Delete ${selectedEndpoint.endpointName}`}
                onCancelClicked={() => setVisibleDeleteConfirmation(false)}
                onDeleteClicked={deleteEndpoint}
                loading={processingDelete}
            >
                <Text>This will permanently delete your model and cannot be undone. This may affect other resources.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const deleteEndpoint = () => {
        setProcessingDelete(true)
        axios.delete(`/endpoint/${selectedEndpoint.endpointName}`, {params: {industrial_model: params.id}}).then((data) => {
            onRefresh();
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
                title={`Attach ${selectedEndpoint.endpointName}`}
                onCancelClicked={() => setVisibleAttachConfirmation(false)}
                onDeleteClicked={attachEndpoint}
                loading={processingAttach}
                deleteButtonText='Attach'
            >
                <Text>This will attach this endpoint to current industrial model.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const attachEndpoint = () => {
        setProcessingAttach(true)
        axios.get(`/endpoint/${selectedEndpoint.endpointName}`, {params: {industrial_model: params.id, action: 'attach'}}).then((data) => {
            onRefresh();
            setVisibleAttachConfirmation(false);
            setProcessingAttach(false);
        }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingAttach(false);
            }        
        )
    }    

    const renderDetachConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleDetachConfirmation}
                title={`Detach ${selectedEndpoint.endpointName}`}
                onCancelClicked={() => setVisibleDetachConfirmation(false)}
                onDeleteClicked={detachEndpoint}
                loading={processingDetach}
                deleteButtonText='Detach'
            >
                <Text>This will dettach this endpoint from current industrial model.</Text>
            </DeleteConfirmationDialog>
        )
    }

    const detachEndpoint = () => {
        setProcessingDetach(true)
        axios.get(`/endpoint/${selectedEndpoint.endpointName}`, {params: {industrial_model: params.id, action: 'detach'}}).then((data) => {
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

    const onSelectionChange = (selectedItems: EndpointItem[]) => {
        if(selectedItems.length > 0) {
            setSelectedEndpoint(selectedItems[0])
            setDisabledDelete(false)
            if(!showAll) {
                setDisabledAttach(true)
                setDisabledDetach(false)
            }
            else {
                var index = endpointCurItems.findIndex((item) => item.endpointName === selectedItems[0].endpointName)
                setDisabledAttach(index >= 0)
                setDisabledDetach(index < 0) 
            }
        }
    }

    const onFetchData = (options: FetchDataOptions) => {
        setPageIndex(options.pageIndex);
    }

    const renderEndpointList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Endpoints'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={showAll ? endpointAllItems : endpointCurItems}
                loading={loading}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
                selectedRowIds={selectedEndpoint !== undefined ? [selectedEndpoint.endpointName] : []}
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
            { selectedEndpoint !== undefined && renderDeleteConfirmationDialog() }
            { selectedEndpoint !== undefined && renderAttachConfirmationDialog() }
            { selectedEndpoint !== undefined && renderDetachConfirmationDialog() }
            { renderEndpointList() }
            { renderSampleCode() }
        </Stack>
    )
}

export default EndpointList;