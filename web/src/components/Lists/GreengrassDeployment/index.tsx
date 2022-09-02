
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Column } from 'react-table'
import { Stack, Button, StatusIndicator, Table} from 'aws-northstar';
import Inline from 'aws-northstar/layouts/Inline';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { getUtcDate } from '../../Utils/Helper';
import './index.scss'
import { useTranslation } from "react-i18next";

interface DataType {
    targetArn: string;
    revisionId: string;
    deploymentId: string;
    creationTime: string;
    status: string;
}

const GreengrassDeploymentList: FunctionComponent = () => {
    const [ greengrassDeploymentItems, setGreengrassDeploymentItems ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    const onRefresh = useCallback(() => {
        setLoading(true)
        axios.get(`/greengrass/deployment`, {params : {'industrial_model': params.id}})
            .then((response) => {
                var items = []
                if(response.data.length === 0) {
                    setGreengrassDeploymentItems(items);
                    setLoading(false);
                }
                else
                    for(let item of response.data) {
                        items.push({targetArn: item.targetArn, revisionId: item.revisionId, deploymentId : item.deploymentId, creationTime: item.creationTimestamp, status: item.deploymentStatus})
                        if(items.length === response.data.length) {
                            setGreengrassDeploymentItems(items);
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
        history.push(`/imodels/${params.id}?tab=greengrassdeployment#create`)
    }

    const getRowId = useCallback(data => data.targetArn + '-' + data.revisionId, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'deployment_id',
            width: 400,
            Header: t('industrial_models.greengrass_deployment.deployment_id'),
            accessor: 'deploymentId',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/imodels/${params.id}?tab=greengrassdeployment#prop:id=${row.original.deploymentId}`}> {row.original.deploymentId} </a>;
                }
                return null;
            }
        },
        {
            id: 'target_arn',
            width: 550,
            Header: t('industrial_models.greengrass_deployment.target_arn'),
            accessor: 'targetArn'
        },
        {
            id: 'revision_id',
            width: 200,
            Header: t('industrial_models.greengrass_deployment.revision_id'),
            accessor: 'revisionId'
        },
        {
            id: 'status',
            width: 100,
            Header: t('industrial_models.common.status'),
            accessor: 'status',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.status;
                    switch(status) {
                        case 'ACTIVE':
                        case 'COMPLETED':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'FAILED':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'CANCELED':
                            return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
                        case 'INACTIVE':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        },
        {
            id: 'deployment_created',
            width: 250,
            Header: t('industrial_models.common.creation_time'),
            accessor: 'creationTime',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return getUtcDate(row.original.creationTime)
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
    
    const renderGreengrassDeploymentlList = () => {
        return (
            <Table
                actionGroup={tableActions}
                tableTitle={t('industrial_models.greengrass_deployments')}
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={greengrassDeploymentItems}
                loading={loading}
                onSelectionChange={console.log}
                getRowId={getRowId}
            />
        )
    }

    return (
        <Stack>
            {renderGreengrassDeploymentlList()}
        </Stack>
    )
}

export default GreengrassDeploymentList;