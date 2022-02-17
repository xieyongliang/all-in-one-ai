import React, { FunctionComponent, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'
import { useHistory } from 'react-router-dom';

interface DataType {
    name: string;
    model?: string;
    version: string;
    version_created: string;
}

const columnDefinitions : Column<DataType>[]= [
    {
        id: 'name',
        width: 200,
        Header: 'Name',
        accessor: 'name'
    },
    {
        id: 'model',
        width: 200,
        Header: 'Model',
        accessor: 'model'
    },
    {
        id: 'version',
        width: 200,
        Header: 'Version',
        accessor: 'version'
    },
    {
        id: 'version_created',
        width: 200,
        Header: 'Version created',
        accessor: 'version_created'
    }
];

const data = [
    {
        name: 'component-model-1',
        model: 'model-1',
        version: '1.0.0',
        version_created: 'Aug 26, 2021 03:01 UTC'
    }
];

interface ComponentProps {
    name: string;
}

const GreengrassComponentList: FunctionComponent<ComponentProps> = (props) => {
    const getRowId = React.useCallback(data => data.name, []);

    const history = useHistory();

    const onCreate = () => {
        history.push('/case/' + props.name + '?tab=component#form')
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
            tableTitle='Greengrass components'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={data}
            onSelectionChange={console.log}
            getRowId={getRowId}
        />
    )
}

export default GreengrassComponentList;