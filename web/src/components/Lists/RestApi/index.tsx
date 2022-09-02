import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import {Column} from 'react-table'
import { useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';
import axios from 'axios';
import { getUtcDate } from '../../Utils/Helper';
import './index.scss'
import { useTranslation } from "react-i18next";

interface DataType {
    name: string;
    function: string;
    creationTime: string;
    uri: string;
}

const RestApiList: FunctionComponent = () => {
    const [ apiItems, setApiItems ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    const onRefresh = useCallback(() => {
        setLoading(true)
        axios.get('/api', {params : {'industrial_model': params.id}})
            .then((response) => {
            var items = []
            if(response.data.length === 0) {
                setApiItems(items);
                setLoading(false);
            }
            else
                for(let item of response.data) {
                    items.push({name: item.api_name, function: item.api_function, creationTime: item.created_date, uri: item.api_url})
                    if(items.length === response.data.length) {
                        setApiItems(items);
                        setLoading(false);
                    }
                }
        }, (error) => {
            console.log(error);
            setLoading(false);
        });        
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=restapi#create`)
    }

    const getRowId = React.useCallback(data => data.name, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'name',
            width: 200,
            Header: t('industrial_models.common.name'),
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
            Header: t('industrial_models.common.function'),
            accessor: 'function'
        },
        {
            id: 'created_date',
            width: 250,
            Header: t('industrial_models.common.creation_time'),
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getUtcDate(row.original.creationTime)
                }
                return null;
            }
        },
        {
            id: 'uri',
            width: 500,
            Header: t('industrial_models.common.uri'),
            accessor: 'uri'
        }
    ];
    
    const tableActions = (
        <Inline>
            <div className='tableaction'>
                <Button icon="refresh" onClick={onRefresh} loading={loading}>{t('industrial_models.common.refresh')}</Button>
            </div>
            <div className='tableaction'>
                <Button variant='primary' onClick={onCreate}>{t('industrial_models.common.create')}</Button>
            </div>
        </Inline>
    );
    
    return (
        <Table
            actionGroup={tableActions}
            tableTitle={t('industrial_models.apis')}
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