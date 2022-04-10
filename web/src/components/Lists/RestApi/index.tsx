import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import {Column} from 'react-table'
import { useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';
import axios from 'axios';
import { getUtcDate } from '../../Utils/Helper';

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

    const onRefresh = useCallback(() => {
        axios.get('/api', {params : {'industrial_model': params.id}})
            .then((response) => {
            var items = []
            if(response.data.length === 0) {
                setApiItems(items);
                setLoading(false);
            }
            else
                for(let item of response.data) {
                    items.push({name: item.api_name, function: item.api_function, created_date: getUtcDate(item.created_date), url: item.api_url})
                    if(items.length === response.data.length) {
                        setApiItems(items);
                        setLoading(false);
                    }
                }
        }, (error) => {
            console.log(error);
        });        
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=restapi#form`)
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
                    return <a href={`/imodels/${params.id}?tab=restapi#prop:id=${row.original.name}`}> {row.original.name} </a>;
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
            <Button icon="refresh" onClick={onRefresh} loading={loading}>Refresh</Button>
            <Button variant='primary' onClick={onCreate}>Create</Button>
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