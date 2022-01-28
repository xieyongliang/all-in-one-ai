
import React, { FunctionComponent, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'

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

const tableActions = (
    <Inline>
        <Button onClick={() => alert('Add button clicked')}>
            Sample code
        </Button>
        <ButtonDropdown
            content="Action"
                items={[{ text: 'Clone' }, { text: 'Create rest api' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
        />        
        <Button variant='primary' onClick={() => alert('Add button clicked')}>
            Create
        </Button>
    </Inline>
);

interface DeploymentProps {
    name: string;
}

const DeploymentList: FunctionComponent<DeploymentProps> = () => {
    const getRowId = React.useCallback(data => data.name, []);

    return (
        <Table
            actionGroup={tableActions}
            tableTitle='Models'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={data}
            onSelectionChange={console.log}
            getRowId={getRowId}
        />
    )
}

export default DeploymentList;