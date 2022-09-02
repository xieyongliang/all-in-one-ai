import React, { FunctionComponent, useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Column } from 'react-table'
import { Stack, Inline } from 'aws-northstar';
import { Table, Button } from 'aws-northstar/components';
import { PathParams } from '../../Interfaces/PathParams';
import axios from 'axios';
import './index.scss'
import { useTranslation } from "react-i18next";

interface DataType {
    name: string;
    version: string;
    arn: string;
}

const GreengrassComponentList: FunctionComponent = () => {
    const [ greengrassComponentItems, setGreengrassComponentItems ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    const onRefresh = useCallback(() => {
        setLoading(true)
        var component_name = 'com.example.yolov5'
        axios.get(`/greengrass/component/${component_name}`, {params : {'industrial_model': params.id}})
            .then((response) => {
                var items = []
                if(response.data.length === 0) {
                    setGreengrassComponentItems(items);
                    setLoading(false);
                }
                else
                    for(let item of response.data) {
                        items.push({name: item.component_name, version: item.component_version, arn : item.component_version_arn})
                        if(items.length === response.data.length) {
                            setGreengrassComponentItems(items);
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
        history.push(`/imodels/${params.id}?tab=greengrasscomponentversion#create`)
    }

    const getRowId = React.useCallback(data => data.arn, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'name',
            width: 200,
            Header: t('industrial_models.greengrass_component.component_name'),
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=greengrasscomponentversion#prop:id=${row.original.arn}`}> {row.original.name} </a>;
                }
                return null;
            }
        },
        {
            id: 'version',
            width: 200,
            Header: t('industrial_models.greengrass_component.component_version'),
            accessor: 'version'
        },
        {
            id: 'arn',
            width: 200,
            Header: t('industrial_models.greengrass_component.component_version_arn'),
            accessor: 'arn'
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

    const renderGreengrassComponentlList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle={t('industrial_models.greengrass_components')}
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={greengrassComponentItems}
                loading={loading}
                onSelectionChange={console.log}
                getRowId={getRowId}
            />
        )
    }

    return (
        <Stack>
            {renderGreengrassComponentlList()}
        </Stack>
    )
}

export default GreengrassComponentList;