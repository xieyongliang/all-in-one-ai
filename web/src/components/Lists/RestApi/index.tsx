import React, { FunctionComponent, useEffect, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'
import { useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';
import axios from 'axios';

interface DataType {
    name: string;
    function: string;
    created_date: string;
    url: string;
}

const RestApiList: FunctionComponent = () => {
    const [ apiItems, setApiItems ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        axios.get('/api', {params : {'industrial_model': params.name}})
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({name: item.api_name, function: item.api_function, created_date: item.created_date, url: item.api_url})
                if(items.length === response.data.length)
                    setApiItems(items)
            }
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [params.name]);

    const onCreate = () => {
        history.push(`/imodels/${params.name}?tab=restapi#form`)
    }

    const getRowId = React.useCallback(data => data.name, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'name',
            width: 200,
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.name}?tab=restapi#prop:id=${row.original.name}`}> {row.original.name} </a>;
                }
                return null;
            }        
        },
        {
            id: 'function',
            width: 250,
            Header: 'Function',
            accessor: 'function'
        },
        {
            id: 'created_date',
            width: 250,
            Header: 'Created date',
            accessor: 'created_date'
        },
        {
            id: 'url',
            width: 500,
            Header: 'Url',
            accessor: 'url'
        }
    ];
    
    const tableActions = (
        <Inline>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Clone' }, { text: 'Delete' }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    return (
        <Table
            actionGroup={tableActions}
            tableTitle='Rest apis'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={apiItems}
            onSelectionChange={console.log}
            loading={loading}
            getRowId={getRowId}
        />
    )
}

export default RestApiList;