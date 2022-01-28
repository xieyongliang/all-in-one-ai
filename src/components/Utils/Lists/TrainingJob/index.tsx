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
    creation_time: string;
    duration: string;
    status?: string;
}

const columnDefinitions : Column<DataType>[]= [
    {
        id: 'name',
        width: 200,
        Header: 'Name',
        accessor: 'name'
    },
    {
        id: 'creation_time',
        width: 200,
        Header: 'Creation time',
        accessor: 'creation_time'
    },
    {
        id: 'duration',
        width: 200,
        Header: 'Duration',
        accessor: 'duration'
    },
    {
        id: 'status',
        width: 200,
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row  }) => {
            if (row && row.original) {
                const status = row.original.status;
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
    }
];

const data = [
    {
        name: 'training-job-1',
        creation_time: 'Aug 26, 2021 03:01 UTC',
        duration: '3 hours',
        status: 'completed'
    }
];

interface TrainingJobListProps {
    name: string;
}

const TrainingJobList: FunctionComponent<TrainingJobListProps> = (props) => {
    const getRowId = React.useCallback(data => data.name, []);
    const history = useHistory();

    const onCreate = () => {
        history.push('/form/' + props.name + '/trainingjob/')
    }
    
    const tableActions = (
        <Inline>
            <Button onClick={() => alert('Add button clicked')}>
                Sample code
            </Button>
            <ButtonDropdown
                content="Action"
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
            tableTitle='Training jobs'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={data}
            onSelectionChange={console.log}
            getRowId={getRowId}
        />
    )
}

export default TrainingJobList;