import React, { FunctionComponent } from 'react';
import Table from 'aws-northstar/components/Table';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'
import { useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';

interface DataType {
    name: string;
    training_job_status?: string;
    model_status?: string;
    endpoint_status?: string;
    restapi_status?: string;
    component_status?: string;
    deployment_status?: string;    
    creation_time: string;
    last_updated: string;
}

const columnDefinitions : Column<DataType>[]= [
    {
        id: 'name',
        width: 100,
        Header: 'Name',
        accessor: 'name'
    },
    {
        id: 'training_job_status',
        width: 130,
        Header: 'Training job',
        accessor: 'training_job_status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.training_job_status;
                switch(status) {
                    case 'completed':
                        return <StatusIndicator  statusType='positive'>Completed</StatusIndicator>;
                    case 'error':
                        return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                    case 'info':
                        return <StatusIndicator  statusType='info'>In progress</StatusIndicator>;
                    default:
                        return null;
                }
            }
            return null;
        }
    },
    {
        id: 'model_status',
        width: 80,
        Header: 'Model',
        accessor: 'model_status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.model_status;
                switch(status) {
                    case 'active':
                        return <StatusIndicator  statusType='positive'>Active</StatusIndicator>;
                    case 'error':
                        return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                    default:
                        return null;
                }
            }
            return null;
        }
    },
    {
        id: 'endpoint_status',
        width: 100,
        Header: 'Endpoint',
        accessor: 'endpoint_status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.endpoint_status;
                switch(status) {
                    case 'completed':
                        return <StatusIndicator  statusType='positive'>Completed</StatusIndicator>;
                    case 'error':
                        return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                    case 'info':
                        return <StatusIndicator  statusType='info'>In progress</StatusIndicator>;
                    default:
                        return null;
                }
            }
            return null;
        }
    },
    {
        id: 'restapi_status',
        width: 100,
        Header: 'Rest api',
        accessor: 'restapi_status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.restapi_status;
                switch(status) {
                    case 'active':
                        return <StatusIndicator  statusType='positive'>Active</StatusIndicator>;
                    case 'error':
                        return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                    default:
                        return null;
                }
            }
            return null;
        }
    },
    {
        id: 'component_status',
        width: 100,
        Header: 'Greengrass component',
        accessor: 'component_status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.component_status;
                switch(status) {
                    case 'active':
                        return <StatusIndicator  statusType='positive'>Active</StatusIndicator>;
                    case 'error':
                        return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                    default:
                        return null;
                }
            }
            return null;
        }
    },
    {
        id: 'deployment_status',
        width: 100,
        Header: 'Greengrass deployment',
        accessor: 'deployment_status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.deployment_status;
                switch(status) {
                    case 'completed':
                        return <StatusIndicator  statusType='positive'>Completed</StatusIndicator>;
                    case 'error':
                        return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                    case 'info':
                        return <StatusIndicator  statusType='info'>In progress</StatusIndicator>;
                    default:
                        return null;
                }
            }
            return null;
        }
    },
    {
        id: 'creation_time',
        width: 150,
        Header: 'Creation time',
        accessor: 'creation_time'
    },   
    {
        id: 'last_update',
        width: 150,
        Header: 'Last updated',
        accessor: 'last_updated'
    }   
];

const data = [
    {
        name: 'training-job-1',
        'training_job_status': 'completed',
        'model_status': 'active',
        'endpoint_status': 'completed',
        'restapi_status': 'active',
        'component_status': 'active',
        'deployment_status': 'completed',
        creation_time: 'Aug 26, 2021 03:01 UTC',
        last_updated: 'Aug 26, 2021 03:01 UTC'
    }
];

const PipelineList: FunctionComponent = () => {
    const getRowId = React.useCallback(data => data.name, []);

    const history = useHistory();

    var params : PathParams = useParams();

    const onCreate = () => {
        history.push('/case/' + params.name + '?tab=pipeline#form')
    }

    const tableActions = (
        <Inline>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Clone' }, { text: 'Create model' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    return (
        <Table
            actionGroup={tableActions}
            tableTitle='Pipeline'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={data}
            onSelectionChange={console.log}
            getRowId={getRowId}
        />
    )
}

export default PipelineList;