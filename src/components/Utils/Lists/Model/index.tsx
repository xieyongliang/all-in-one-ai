import React, { FunctionComponent, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'
import { useHistory } from 'react-router-dom';

interface DataType {
    name: string;
    creation_time: string;
    training_job?: string;
}

const columnDefinitions : Column<DataType>[]= [
    {
        id: 'name',
        width: 100,
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
        id: 'training_job',
        width: 400,
        Header: 'Training job',
        accessor: 'training_job'
    }
];

const data = [
    {
        name: 'model-1',
        creation_time: 'Aug 26, 2021 03:01 UTC',
        training_job: 'training-job-1'
    }
];

interface ModelProps {
    name: string;
}

const ModelList: FunctionComponent<ModelProps> = (props) => {
    const getRowId = React.useCallback(data => data.name, []);

    const history = useHistory();

    const onCreate = () => {
        history.push('/form/' + props.name + '/model/')
    }

    const tableActions = (
        <Inline>
            <Button onClick={() => alert('Add button clicked')}>
                Sample code
            </Button>
            <ButtonDropdown
                content="Action"
                    items={[{ text: 'Clone' }, { text: 'Create endpoint' }, { text: 'Add/Edit tags' }]}
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

export default ModelList;