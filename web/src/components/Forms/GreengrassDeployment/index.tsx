import { FunctionComponent, useEffect, useRef, useState, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Column } from 'react-table'
import { Form, Button, RadioGroup, RadioButton, Stack, Select, Table, Text, FormSection, FormField, Input } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';

interface DataType {
    name: string;
    versions: string[];
    arns: string[];
    config: string;
    selected: boolean;
}

interface PathParams {
    name: string;
}

interface GreengrassDeploymentFormProps {
    wizard?: boolean;
}

const GreengrassDeploymentForm: FunctionComponent<GreengrassDeploymentFormProps> = (props) => {
    const [ deploymentName, setDeploymentName ] = useState('')
    const [ itemsComponents ] = useState<DataType[]>([])
    const [ itemsCoreDevices ] = useState([])
    const [ optionsCoreDevices ] = useState([])
    const [ itemsThingGroups ] = useState([])
    const [ optionsThingGroups ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ targetType, setTargetType ] = useState('1');
    const [ selectedComponentVersions ] = useState([]);
    const [ selectedCoreDevice, setSelectedCoreDevice ] = useState<SelectOption>({})
    const [ selectedThingGroup, setSelectedThingGroup ] = useState<SelectOption>({})
    const [ tags ] = useState([])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidCoreDevice, setInvalidCoreDevice ] = useState(false)
    const [ invalidThingGroup, setInvalidThingGroup ] = useState(false)
    const [ forceRefreshed, setForceRefreshed ] = useState(false)

    const casename = useRef('');

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        const request1 = axios.get(`/greengrass/component`, {params : {'case': params.name}})
        const request2 = axios.get(`/greengrass/coredevices`, {params : {'case': params.name}})
        const request3 = axios.get(`/greengrass/thinggroups`, {params : {'case': params.name}})
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            for(let item of response1.data) {
                var names = Object.keys(item)
                var name = names[0]
                var config = ''
                var selected = false;
                var versions = item[names[0]]['component_versions']
                var arns = item[names[0]]['component_version_arns']
                itemsComponents.push({name: name, versions: versions, arns : arns, config: config, selected: selected})
                selectedComponentVersions[name] = {label: versions[0], value: versions[0]}
            }
            for(let item of response2.data) {
                name = item['coreDeviceThingName']
                var status = item['status']
                var last_updated = item['lastStatusUpdateTimestamp']
                optionsCoreDevices.push({label: name, value: name})
                itemsCoreDevices.push({name: name, status: status, last_updated: last_updated})
            }
            for(let item of response3.data) {
                name = item['groupName']
                var arn = item['groupArn']
                optionsThingGroups.push({label: name, value: name})
                itemsThingGroups.push({name: name, arn: arn})
            }
            
            setLoading(false);
        }));
    }, [params.name, itemsComponents, itemsCoreDevices, itemsThingGroups, selectedComponentVersions, optionsCoreDevices, optionsThingGroups]);

    const onChange = (id: string, event: any, option?: string) => {
        if(id === 'formFieldIdCoreDevices') {
            setSelectedCoreDevice({label: event.target.value, value: event.target.value})
            setInvalidCoreDevice(false)
        }
        else if(id === 'formFieldIdThingGroups') {
            setSelectedThingGroup({label: event.target.value, value: event.target.value})
            setInvalidThingGroup(false)
        }
        else if(id === 'formFieldIdDeploymentName')
            setDeploymentName(event)
        else if(option === 'versions') {
            console.log(id)
            selectedComponentVersions[id] = {label: event.target.value, value: event.target.value};
            setForceRefreshed(!forceRefreshed)
        } 
        else if(option === 'config') {
            var index = itemsComponents.findIndex((item)=> item.name === id )
            itemsComponents[index].config = event;
            setForceRefreshed(!forceRefreshed)
        }
    }

    const onSubmit = () => {
        if(targetType === '1' && selectedThingGroup.value === undefined)
            setInvalidThingGroup(true)
        else if(targetType ==='0' && selectedCoreDevice.value === undefined)
            setInvalidCoreDevice(true)
        else {
            var target_arn
            if(targetType === '1')
                target_arn = itemsThingGroups[itemsThingGroups.findIndex((item) => item.name === selectedThingGroup.value)]['arn']
            else
                target_arn = itemsCoreDevices[itemsCoreDevices.findIndex((item) => item.name === selectedCoreDevice.value)]['name']
            var deployment_name = deploymentName
            var components = {}
            
            itemsComponents.forEach(itemComponent => {
                if(itemComponent.selected)
                    components[itemComponent.name] = {componentVersion: selectedComponentVersions[itemComponent.name].value}
            });

            var body = {
                'deployment_name': deployment_name,
                'target_arn': target_arn,
                'components': components,
                'case_name': params.name
            }

            axios.post('/greengrass/deployment', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=greengrassdeployment`)
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });

        }
    }

    const onCancel = () => {
        history.push('/case/' + params.name + '?tab=greengrassdeployment')
    }

    const onChangeOptions = (event, value)=>{
        setTargetType(value)
    }

    const onSelectionChange = (selectedItems: DataType[]) => {
        var selected = {}
        selectedItems.forEach((selectedItem) => {
            selected[selectedItem.name] = ''    
        })
        itemsComponents.forEach((itemComponent) => {
            itemComponent.selected = (itemComponent.name in selected)
        })
    }

    const onAddTag = () => {
        tags.push({key:'', value:''});
        setForcedRefresh(!forcedRefresh);
    }

    const onRemoveTag = (index) => {
        tags.splice(index, 1);
        setForcedRefresh(!forcedRefresh);
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard
    
        const getRowId = useCallback(data => data.name, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'name',
            width: 400,
            Header: 'Component name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return (
                        <Text> {row.original.name} </Text>
                    )
                }
                return null;
            }
        },
        {
            id: 'version',
            width: 400,
            Header: 'Component version',
            accessor: 'versions',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    var options = []
                    row.original.versions.forEach(version => {
                        options.push({label: version, value: version})
                    });
                    return (
                        <Select
                            placeholder='Choose an option'
                            options={options}
                            selectedOption={selectedComponentVersions[row.original.name]}
                            onChange={(event) => onChange(row.original.name, event, 'versions')}
                        />
                    )
                }
                return null;
            }
        },
        {
            id: 'config',
            width: 400,
            Header: 'Component deployment configuration',
            accessor: 'config',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    var index = itemsComponents.findIndex((item)=> item.name === row.original.name)
                    return <Input type='text' value={itemsComponents[index].config} placeholder='Default' onChange={(event) => onChange(row.original.name, event, 'config')} />;
                }
                return null;
            }        
        }
    ];
        
    const renderGreengrassDeploymentSetting = () => {
        if(!wizard) {
            return (
                <FormSection header='Greengrass deployment setting'>
                    <FormField label='Deployment name' description='A friendly name lets you identify this deployment. If you leave it blank, the deployment displays its ID instead of a name.' controlId='formFieldIdDeploymentName'>
                        <Input type='text' value={deploymentName} onChange={(event)=>{onChange('formFieldIdDeploymentName', event)}}/>
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderTargetOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='0' checked={targetType === '0'}>Core device</RadioButton>, 
                    <RadioButton value='1' checked={targetType === '1'}>Thing group</RadioButton>                
                ]}
            />
        )
    }
    const renderGreengrassDeploymentTarget = () => {
        if(targetType === '1') {
            return (
                <FormSection header='Deployment target' description='You can deploy to a single Greengrass core device or a group of core devices.'>
                    <FormField label='Target type' controlId='formFieldIdTargetType'>
                        {renderTargetOptions()}
                    </FormField>
                    <FormField label='Target name' controlId='formFieldIdThingGroups'>
                        <Select
                            placeholder='Choose an option'
                            options={optionsThingGroups}
                            selectedOption={selectedThingGroup}
                            invalid={invalidThingGroup}
                            onChange={(event) => onChange('formFieldIdThingGroups', event)}
                        />
                    </FormField>
                </FormSection>
            )
        }
        else {
            return (
                <FormSection header='Deployment target' description='You can deploy to a single Greengrass core device or a group of core devices.'>
                    <FormField label='Target type' controlId='formFieldIdTargetType'>
                        {renderTargetOptions()}
                    </FormField>
                    <FormField label='Target name' controlId='formFieldIdTargetName'>
                        <Select
                            placeholder='Choose an option'
                            options={optionsCoreDevices}
                            selectedOption={selectedCoreDevice}
                            invalid={invalidCoreDevice}
                            onChange={(event) => onChange('formFieldIdCoreDevices', event)}
                        />
                    </FormField>
                </FormSection>
            )
        }
    }

    const renderGreengrassDeploymentTag = () => {
        if(!wizard) {
            return (
                <FormSection header='Tags - optional'>
                    {
                        tags.length>0 && 
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> Key </Text>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> Value </Text> 
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text>  </Text>
                                </Grid>
                            </Grid>
                    }
                    {
                        tags.map((tag, index) => (
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={tag.key}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={tag.value}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant='link' size='large' onClick={onAddTag}>Add tag</Button>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderGreengrassDeploymentContent = () => {
        return (
            <Table
                tableTitle='Greengrass components'
                columnDefinitions={columnDefinitions}
                items={itemsComponents}
                loading={loading}
                onSelectionChange={onSelectionChange}
                getRowId={getRowId}
            />
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderGreengrassDeploymentSetting()}
                {renderGreengrassDeploymentTarget()}
                {renderGreengrassDeploymentContent()}
                {renderGreengrassDeploymentTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header='Create Greengrass deployment'
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit}>Submit</Button>
                    </div>
                }>        
                {renderGreengrassDeploymentSetting()}
                {renderGreengrassDeploymentTarget()}
                {renderGreengrassDeploymentContent()}
                {renderGreengrassDeploymentTag()}
            </Form>
        )
    }
}

export default GreengrassDeploymentForm;