
import React, { FunctionComponent, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'
import { useHistory } from 'react-router-dom';

interface DataType {
    name: string;
    model: string;
    creation_time: string;
    status: string;
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
        id: 'model',
        width: 400,
        Header: 'Container image',
        accessor: 'model'
    },
    {
        id: 'creation_time',
        width: 200,
        Header: 'Creation time',
        accessor: 'creation_time'
    },
    {
        id: 'status',
        width: 400,
        Header: 'Model artificate',
        accessor: 'status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.status;
                switch(status) {
                    case 'completed':
                        return <StatusIndicator  statusType='positive'>In service</StatusIndicator>;
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
        id: 'last_update',
        width: 400,
        Header: 'Last updated',
        accessor: 'last_updated'
    }
];

const data = [
    {
        name: 'endpoint-1',
        model: 'model-1',
        creation_time: 'Aug 26, 2021 03:01 UTC',
        status: 'completed',
        last_updated: 'Aug 26, 2021 03:01 UTC'
    }
];

interface ModelProps {
    name: string;
}

const EndpointList: FunctionComponent<ModelProps> = (props) => {
    const getRowId = React.useCallback(data => data.name, []);

    const history = useHistory();

    const onCreate = () => {
        history.push('/case/' + props.name + '?tab=endpoint#form')
    }
    
    const tableActions = (
        <Inline>
            <Button onClick={() => alert('Add button clicked')}>
                Sample code
            </Button>
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
            tableTitle='Models'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={data}
            onSelectionChange={console.log}
            getRowId={getRowId}
        />
    )
}

export default EndpointList;