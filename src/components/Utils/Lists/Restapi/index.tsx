import React, { FunctionComponent, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'

interface DataType {
    name: string;
    endpoint: string;
    creation_time: string;
    api: string;
    path: string;
    uri: string;
}

const columnDefinitions : Column<DataType>[]= [
    {
        id: 'name',
        width: 100,
        Header: 'Name',
        accessor: 'name'
    },
    {
        id: 'endpoint',
        width: 100,
        Header: 'Endpoint',
        accessor: 'endpoint'
    },
    {
        id: 'creation_time',
        width: 200,
        Header: 'Creation time',
        accessor: 'creation_time'
    },
    {
        id: 'api',
        width: 100,
        Header: 'Rest api gateway',
        accessor: 'api'
    },
    {
        id: 'Rest api path',
        width: 100,
        Header: 'Rest api path',
        accessor: 'path'
    }
    ,
    {
        id: 'Rest api uri',
        width: 400,
        Header: 'Rest api uri',
        accessor: 'uri'
    }
];

const data = [
    {
        name: 'model-1',
        endpoint: 'endpoint-1',
        creation_time: 'Aug 26, 2021 03:01 UTC',
        api: 'spot-bot-api',
        path: '/image',
        uri: 'https://9tary5tnu5.execute-api.ap-east-1.amazonaws.com/Prod/image'
    }
];

const tableActions = (
    <Inline>
        <Button onClick={() => alert('Add button clicked')}>
            Sample code
        </Button>
        <ButtonDropdown
            content="Action"
                items={[{ text: 'Clone' }, { text: 'Delete' }, { text: 'Add/Edit tags' }]}
        />        
        <Button variant='primary' onClick={() => alert('Add button clicked')}>
            Create
        </Button>
    </Inline>
);

interface RestapiProps {
    name: string;
}

const RestapiList: FunctionComponent<RestapiProps> = () => {
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

export default RestapiList;