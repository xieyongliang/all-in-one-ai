import { FunctionComponent, useEffect, useState, useCallback } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, Flashbar, Table } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';
import { Column } from 'react-table'

const GreengrassDeploymentProp: FunctionComponent = () => {
    const [ targetArn, setTargetArn ] = useState('')
    const [ revisionId, setRevisionId ] = useState('')
    const [ deploymentStatus, setDeploymentStatus ] = useState('')
    const [ iotJobId, setIotJobId ] = useState('')
    const [ creationTimestamp, setCreationTimestamp ] = useState('')
    const [ loading, setLoading ] = useState(true);
    const [ items ] = useState([])

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
            console.log(error);
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
            Header: 'Component name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/industrialmodel/${params.id}?tab=greengrasscomponent#prop:id=${row.original.arn}`}> {row.original.name} </a>;
                }
                return null;
            }
        },
        {
            id: 'version',
            width: 200,
            Header: 'Component version',
            accessor: 'version'
        }
    ];
    
    const renderFlashbar = () => {
        return (
            <Flashbar items={[{
                header: 'Loading Greengrass deployment information...',
                content: 'This may take up to an minute. Please wait a bit...',
                dismissible: true,
                loading: loading
            }]} />
        )
    }

    const renderGreengrassDeploymentOverview = () => {
        return (
            <FormSection header='Greengrass deployment overview'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Target' value={targetArn}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Deployment status' value={deploymentStatus}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Deployment created' value={creationTimestamp}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='IoT job' value={iotJobId}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Revision Id' value={revisionId}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderGreengrassComponentlList = () => {
        return (
            <Table
                tableTitle='Greengrass components'
                multiSelect={false}
                columnDefinitions={columnDefinitions}
                items={items}
                loading={loading}
                onSelectionChange={console.log}
                getRowId={getRowId}
            />
        )
    }

    return (
        <Form
            header='Review Greengrass deployment'
            description='This deployment targets an AWS IoT thing group. Add a core device to the thing group to apply this deployment to it.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            { loading && renderFlashbar() }
            { !loading && renderGreengrassDeploymentOverview() }
            { !loading && renderGreengrassComponentlList() }
        </Form>
    )
}

export default GreengrassDeploymentProp;