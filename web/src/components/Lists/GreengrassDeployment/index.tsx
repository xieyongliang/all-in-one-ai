
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
    target_name: string;
    target_type: string;
    status: string;
    deployment_created: string;
}

const columnDefinitions : Column<DataType>[]= [
    {
        id: 'name',
        width: 300,
        Header: 'Name',
        accessor: 'name'
    },
    {
        id: 'target_name',
        width: 200,
        Header: 'Target name',
        accessor: 'target_name'
    },
    {
        id: 'target_type',
        width: 100,
        Header: 'Target type',
        accessor: 'target_type'
    },
    {
        id: 'status',
        width: 100,
        Header: 'Model artificate',
        accessor: 'status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.status;
                switch(status) {
                    case 'active':
                        return <StatusIndicator  statusType='positive'>Active</StatusIndicator>;
                    case 'completed':
                        return <StatusIndicator  statusType='positive'>Completed</StatusIndicator>;
                    case 'error':
                        return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
                    case 'canceled':
                        return <StatusIndicator  statusType='info'>Canceled</StatusIndicator>;
                    default:
                        return null;
                }
            }
            return null;
        }
    },
    {
        id: 'deployment_created',
        width: 200,
        Header: 'Deployment created',
        accessor: 'deployment_created'
    }
];

const data = [
    {
        name: 'Deployment for GreengrassQuickStartGroup',
        target_name: 'GreengrassQuickStartGroup',
        target_type: 'Thing group',
        status: 'active',
        deployment_created: 'Aug 26, 2021 03:01 UTC'
    }
];

const GreengrassDeploymentList: FunctionComponent = () => {
    const getRowId = React.useCallback(data => data.name, []);

    const history = useHistory();

    var params : PathParams = useParams();

    const onCreate = () => {
        history.push('/case/' + params.name + '?tab=deployment#form')
    }

    const tableActions = (
        <Inline>
            <ButtonDropdown
                content="Action"
                    items={[{ text: 'Clone' }, { text: 'Create rest api' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    return (
        <Table
            actionGroup={tableActions}
            tableTitle='Greengrass deployments'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={data}
            onSelectionChange={console.log}
            getRowId={getRowId}
        />
    )
}

export default GreengrassDeploymentList;