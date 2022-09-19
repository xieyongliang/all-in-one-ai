import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import {Column} from 'react-table'
import { useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';
import axios from 'axios';
import { getLocaleDate, logOutput } from '../../Utils/Helper';
import './index.scss'
import { useTranslation } from "react-i18next";

interface PipelineItem {
    pipelineExecutionArn: string;
    pipelineName: string;
    pipelineExecutionStatus: string;
    creationTime: string;
    lastModifiedTime: string;
}

const PipelineList: FunctionComponent = () => {
    const [ pipelineItems, setPipelineItems ] = useState([])
    const [ loading, setLoading ] = useState(true)

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    const onRefresh = useCallback(() => {
        setLoading(true)
        axios.get('/pipeline', {params : {'industrial_model': params.id}})
            .then((response) => {
            var items = []
            if(response.data.length === 0) {
                setPipelineItems(items);
                setLoading(false);
            }
            else 
                for(let item of response.data) {
                    items.push({pipelineExecutionArn : item.PipelineExecutionArn, pipelineName: item.PipelineExperimentConfig['ExperimentName'], pipelineExecutionStatus: item.PipelineExecutionStatus, creationTime: item.CreationTime, lastModifiedTime: item.LastModifiedTime})
                    if(items.length === response.data.length) {
                        setPipelineItems(items);
                        setLoading(false);
                    }
                }
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
            setLoading(false);
        });
    }, [params.id])

    useEffect(() => {
        onRefresh()
    }, [onRefresh]);

    const onCreate = () => {
        history.push(`/imodels/${params.id}?tab=pipeline#create`)
    }

    const getRowId = useCallback(data => data.pipelineExecutionArn, []);

    const columnDefinitions : Column<PipelineItem>[]= [
        {
            id: 'pipelineExecutionArn',
            width: 700,
            Header: t('industrial_models.pipeline.execution_arn'),
            accessor: 'pipelineExecutionArn',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=pipeline#prop:id=${row.original.pipelineExecutionArn}`}> {row.original.pipelineExecutionArn} </a>;
                }
                return null;
            }        
        },
        {
            id: 'pipelineName',
            width: 150,
            Header: t('industrial_models.common.name'),
            accessor: 'pipelineName'
        },
        {
            id: 'pipelineExecutionStatus',
            width: 150,
            Header: t('industrial_models.common.status'),
            accessor: 'pipelineExecutionStatus',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.pipelineExecutionStatus;
                    switch(status) {
                        case 'Succeeded':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'Failed':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'Executing':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        case 'Stopping':
                        case 'Stopped':
                            return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 250,
            Header: t('industrial_models.common.creation_time'),
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getLocaleDate(row.original.creationTime)
                }
                return null;
            }
        },   
        {
            id: 'lastModifiedTime',
            width: 250,
            Header: t('industrial_models.common.last_modified_time'),
            accessor: 'lastModifiedTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getLocaleDate(row.original.lastModifiedTime)
                }
                return null;
            }
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

    const renderPipelineList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle={t('industrial_models.pipelines')}
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={pipelineItems}
                loading={loading}
                getRowId={getRowId}
            />
        )
    }

    return (
        <div>
            { renderPipelineList() }
        </div>
    )
}

export default PipelineList;