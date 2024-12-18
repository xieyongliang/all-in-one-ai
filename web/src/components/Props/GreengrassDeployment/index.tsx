import { FunctionComponent, useEffect, useState, useCallback } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, Table, LoadingIndicator } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';
import { Column } from 'react-table'
import { useTranslation } from "react-i18next";
import { logOutput } from '../../Utils/Helper';

const GreengrassDeploymentProp: FunctionComponent = () => {
    const [ targetArn, setTargetArn ] = useState('')
    const [ revisionId, setRevisionId ] = useState('')
    const [ deploymentStatus, setDeploymentStatus ] = useState('')
    const [ iotJobId, setIotJobId ] = useState('')
    const [ creationTimestamp, setCreationTimestamp ] = useState('')
    const [ loading, setLoading ] = useState(true);
    const [ items ] = useState([])

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    interface DataType {
        name: string;
        version: string;
        arn: string;
    }
    
    useEffect(() => {
        axios.get(`/greengrass/deployment/${id}`, {params: {'industrial_model': params.id}})
            .then((response) => {
            setTargetArn(response.data.targetArn);
            setRevisionId(response.data.revisionId);
            setDeploymentStatus(response.data.deploymentStatus);
            setIotJobId(response.data.iotJobId);
            setCreationTimestamp(response.data.creationTimestamp);
            var urls = []
            Object.keys(response.data.components).forEach(component_name => {
                var item = {};
                item['name'] = component_name;
                item['version'] = response.data.components[component_name].componentVersion;
                item['arn'] = item['name']
                urls.push(`/greengrass/component/${component_name}`)
                items.push(item)
            });
            var index = 0
            axios.all(urls.map((url) => axios.get(url))).then(
                (responses) => {
                    responses.forEach(response => {
                        items[index]['arn'] = response.data[0].component_version_arn
                        index++
                    })
                    setLoading(false);
                }
              );
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
        });
    }, [id, params.id, items])

    const onClose = () => {
        history.goBack()
    }

    const getRowId = useCallback(data => data.name, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'name',
            width: 200,
            Header: t('industrial_models.greengrass_deployment.component_name'),
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
            Header: t('industrial_models.greengrass_deployment.component_version'),
            accessor: 'version'
        }
    ];
    
    const renderGreengrassDeploymentOverview = () => {
        return (
            <FormSection header='Greengrass deployment overview'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_deployment.target_arn')} value={targetArn}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.status')} value={deploymentStatus}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.creation_time')} value={creationTimestamp}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_deployment.target_arn')} value={iotJobId}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_deployment.iot_job')} value={revisionId}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderGreengrassComponentlList = () => {
        return (
            <Table
                tableTitle={t('industrial_models.greengrass_deployments')}
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={items}
                loading={loading}
                getRowId={getRowId}
            />
        )
    }

    return (
        <Form
            header={t('industrial_models.greengrass_deployment.review_greengrass_deployment')}
            description={t('industrial_models.greengrass_deployment.create_greengrass_deployment_description')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
            { !loading && renderGreengrassDeploymentOverview() }
            { !loading && renderGreengrassComponentlList() }
        </Form>
    )
}

export default GreengrassDeploymentProp;