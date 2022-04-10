
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

interface EndpointItem {
    endpointName: string;
    endpointStatus: string;
    creationTime: string;
    lastModifiedTime: string;
}

const EndpointList: FunctionComponent = () => {
    const [ endpointItems, setEndpointItems ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<EndpointItem>()
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
        history.push(`/imodels/${params.id}?tab=endpoint#form`)
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

    const onRefresh = useCallback(() => {
        setLoading(true)
        var request = showAll ? axios.get('/endpoint', {params : {'action': 'list'}}) : axios.get('/endpoint', {params : {'industrial_model': params.id}})
        request.then(
            (response) => {
                var items = []
                if(response.data.length === 0) {
                    setEndpointItems(items);
                    setLoading(false);
                }
                else
                    for(let item of response.data) {
                        items.push({endpointName: item.EndpointName, endpointStatus: item.EndpointStatus, creationTime: getUtcDate(item.CreationTime), lastModifiedTime: getUtcDate(item.LastModifiedTime)})
                        if(items.length ===  response.data.length) {
                            setEndpointItems(items);
                            setLoading(false);
                        }
                    }
            }, (error) => {
                console.log(error);
            }
        );
    }, [params.id, showAll])

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
            accessor: 'creationTime'
        },
        {
            id: 'lastModifiedTime',
            width: 250,
            Header: 'Last updated',
            accessor: 'lastModifiedTime'
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
            setDisabledAttach(false)
            setDisabledDetach(false)
        }
    }

    const renderEndpointList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle='Endpoints'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={endpointItems}
                loading={loading}
                onSelectionChange={onSelectionChange}
                selectedRowIds={selectedEndpoint !== undefined ? [selectedEndpoint.endpointName] : []}
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
            { selectedEndpoint !== undefined && renderDeleteConfirmationDialog() }
            { selectedEndpoint !== undefined && renderAttachConfirmationDialog() }
            { selectedEndpoint !== undefined && renderDetachConfirmationDialog() }
            { renderEndpointList() }
            { renderSampleCode() }
        </Stack>
    )
}

export default EndpointList;