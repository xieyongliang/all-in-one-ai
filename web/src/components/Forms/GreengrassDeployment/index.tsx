import { FunctionComponent, useEffect, useState, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Column } from 'react-table'
import { Form, Button, RadioGroup, RadioButton, Stack, Select, Table, Text, FormSection, FormField, Input } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import { UpdateGreengrassDeploymentComponents, UpdateGreengrassDeploymentName, UpdateGreengrassDeploymentTargetArn, UpdateGreengrassDeploymentTargetType } from '../../../store/pipelines/actionCreators';
import { PathParams } from '../../Interfaces/PathParams';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
    updateGreengrassDeploymentNameAction: (greengrassDeploymentName: string) => any;
    updateGreengrassDeploymentTargetTypeAction: (greengrassDeploymentTargetType: string) => any;
    updateGreengrassDeploymentTargetArnAction: (greengrassDeploymentTargetArn: string) => any;
    updateGreengrassDeploymentComponentsAction: (greengrassDeploymentComponents: string) => any;
    greengrassComponentName: string;
    greengrassComponentVersion: string;
    greengrassDeploymentTargetType: string;
    greengrassDeploymentTargetArn : string;
    greengrassDeploymentComponents: string;
    wizard?: boolean;
}

interface ComponentVersionItem {
    name: string;
    versions: string[];
    config: string;
    selected: boolean;
}

const GreengrassDeploymentForm: FunctionComponent<IProps> = (props) => {
    const [ deploymentName, setDeploymentName ] = useState('')
    const [ itemsComponents ] = useState<ComponentVersionItem[]>([])
    const [ itemsCoreDevices ] = useState([])
    const [ optionsCoreDevices ] = useState([])
    const [ itemsThingGroups ] = useState([])
    const [ optionsThingGroups ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ targetType, setTargetType ] = useState(props.wizard ? props.greengrassDeploymentTargetType : '1');
    const [ selectedComponentVersions ] = useState([]);
    const [ selectedCoreDevice, setSelectedCoreDevice ] = useState<SelectOption>({})
    const [ selectedThingGroup, setSelectedThingGroup ] = useState<SelectOption>({})
    const [ tags ] = useState([])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ processing, setProcessing ] = useState(false)
    const [ forceRefreshed, setForceRefreshed ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var selectedComponents = [];

    var wizard : boolean = props.wizard

    if(wizard) {
        var components = JSON.parse(props.greengrassDeploymentComponents)
        Object.keys(components).forEach((componentName) => {
            selectedComponents.push(componentName);
        })
    }

    var greengrassComponentName = props.greengrassComponentName
    var greengrassComponentVersion = props.greengrassComponentVersion
    var greengrassDeploymentTargetType = props.greengrassDeploymentTargetType
    var greengrassDeploymentTargetArn = props.greengrassDeploymentTargetArn

    useEffect(() => {
        const request1 = axios.get(`/greengrass/component`)
        const request2 = axios.get(`/greengrass/coredevices`)
        const request3 = axios.get(`/greengrass/thinggroups`)
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            for(let item of response1.data) {
                var names = Object.keys(item)
                var name = names[0]
                var config = ''
                var selected = false;
                var versions = item[names[0]]['component_versions']
                if(name === greengrassComponentName)
                    versions.splice(0, 0, greengrassComponentVersion)
                itemsComponents.push({name: name, versions: versions, config: config, selected: selected})
                selectedComponentVersions[name] = {label: versions[0], value: versions[0]}
            }
            for(let item of response2.data) {
                name = item['coreDeviceThingName']
                var status = item['status']
                var last_updated = item['lastStatusUpdateTimestamp']
                optionsCoreDevices.push({label: name, value: name})
                itemsCoreDevices.push({name: name, status: status, last_updated: last_updated})
                if(wizard)
                    if(greengrassDeploymentTargetType === '0' && name === greengrassDeploymentTargetArn)
                        setSelectedCoreDevice({label: name, value: name})
            }
            for(let item of response3.data) {
                name = item['groupName']
                var arn = item['groupArn']
                optionsThingGroups.push({label: name, value: name})
                itemsThingGroups.push({name: name, arn: arn})
                if(wizard)
                    if(greengrassDeploymentTargetType === '1' && arn === greengrassDeploymentTargetArn)
                        setSelectedThingGroup({label: name, value: name})
            }
            setLoading(false);
        }));
    }, [wizard, greengrassDeploymentTargetType, greengrassDeploymentTargetArn, greengrassComponentName, greengrassComponentVersion, itemsComponents, itemsCoreDevices, itemsThingGroups, optionsCoreDevices, optionsThingGroups, selectedComponentVersions]);

    const onChange = (id: string, event: any, option?: string) => {
        if(id === 'formFieldIdCoreDevices') {
            setSelectedCoreDevice({label: event.target.value, value: event.target.value});
            if(targetType === '0')
                if(wizard)
                    props.updateGreengrassDeploymentTargetArnAction(event.target.value);
        }
        else if(id === 'formFieldIdThingGroups') {
            setSelectedThingGroup({label: event.target.value, value: event.target.value});
            if(targetType === '1')
                if(wizard)
                    props.updateGreengrassDeploymentTargetArnAction(itemsThingGroups[itemsThingGroups.findIndex((item) => item.name === event.target.value)]['arn']);
        }
        else if(id === 'formFieldIdDeploymentName') {
            setDeploymentName(event);
            if(wizard)
                props.updateGreengrassDeploymentNameAction(event);
        }
        else if(option === 'versions') {
            selectedComponentVersions[id] = {label: event.target.value, value: event.target.value};
            setForceRefreshed(!forceRefreshed);
        } 
        else if(option === 'config') {
            var index = itemsComponents.findIndex((item)=> item.name === id )
            itemsComponents[index].config = event;
            setForceRefreshed(!forceRefreshed);
        }
    }

    const onSubmit = () => {
        var target_arn;
        if(targetType === '1')
            target_arn = itemsThingGroups[itemsThingGroups.findIndex((item) => item.name === selectedThingGroup.value)]['arn'];
        else
            target_arn = itemsCoreDevices[itemsCoreDevices.findIndex((item) => item.name === selectedCoreDevice.value)]['name'];
        
        var deployment_name = deploymentName;    
        var components = {};
            
        itemsComponents.forEach(itemComponent => {
            if(itemComponent.selected)
                components[itemComponent.name] = {componentVersion: selectedComponentVersions[itemComponent.name].value};
        });

        var body = {
            'deployment_name': deployment_name,
            'target_arn': target_arn,
            'components': JSON.stringify(components),
            'industrial_model': params.id
        }
        setProcessing(true)
        axios.post('/greengrass/deployment', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.goBack();
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessing(false);
            });
    }

    const onCancel = () => {
        history.goBack();
    }

    const onChangeOptions = (event, value)=>{
        setTargetType(value);
        if(wizard)
            props.updateGreengrassDeploymentTargetTypeAction(value);
    }

    const onSelectionChange = (selectedItems: ComponentVersionItem[]) => {
        var selected = {};
        selectedItems.forEach((selectedItem) => {
            selected[selectedItem.name] = '';
        })
        itemsComponents.forEach((itemComponent) => {
            itemComponent.selected = (itemComponent.name in selected);
        })
        
        var components = {};
        itemsComponents.forEach(itemComponent => {
            if(itemComponent.selected)
                components[itemComponent.name] = {componentVersion: selectedComponentVersions[itemComponent.name].value};
        });

        props.updateGreengrassDeploymentComponentsAction(JSON.stringify(components));
    }

    const onAddTag = () => {
        tags.push({key:'', value:''});
        setForcedRefresh(!forcedRefresh);
    }

    const onRemoveTag = (index) => {
        tags.splice(index, 1);
        setForcedRefresh(!forcedRefresh);
    }
    
    const getRowId = useCallback(data => data.name, []);

    const columnDefinitions : Column<ComponentVersionItem>[]= [
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
                    <FormField label='Deployment name' description='A friendly name lets you identify this deployment. If you leave it blank, the deployment displays its ID instead of a name.' controlId={uuidv4()}>
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
                    <FormField label='Target type' controlId={uuidv4()}>
                        {renderTargetOptions()}
                    </FormField>
                    <FormField label='Target name' controlId={uuidv4()}>
                        <Select
                            placeholder='Choose an option'
                            options={optionsThingGroups}
                            selectedOption={selectedThingGroup}
                            onChange={(event) => onChange('formFieldIdThingGroups', event)}
                        />
                    </FormField>
                </FormSection>
            )
        }
        else {
            return (
                <FormSection header='Deployment target' description='You can deploy to a single Greengrass core device or a group of core devices.'>
                    <FormField label='Target type' controlId={uuidv4()}>
                        {renderTargetOptions()}
                    </FormField>
                    <FormField label='Target name' controlId={uuidv4()}>
                        <Select
                            placeholder='Choose an option'
                            options={optionsCoreDevices}
                            selectedOption={selectedCoreDevice}
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
        if(props.wizard)
            return (
                <Table
                    tableTitle='Greengrass components'
                    columnDefinitions={columnDefinitions}
                    items={itemsComponents}
                    loading={loading}
                    onSelectionChange={onSelectionChange}
                    selectedRowIds={selectedComponents}
                    getRowId={getRowId}
                />
            )
        else
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
                        <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
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

const mapDispatchToProps = {
    updateGreengrassDeploymentNameAction: UpdateGreengrassDeploymentName,
    updateGreengrassDeploymentTargetTypeAction: UpdateGreengrassDeploymentTargetType,
    updateGreengrassDeploymentTargetArnAction: UpdateGreengrassDeploymentTargetArn,
    updateGreengrassDeploymentComponentsAction: UpdateGreengrassDeploymentComponents
};

const mapStateToProps = (state: AppState) => ({
    greengrassComponentName: state.pipeline.greengrassComponentName,
    greengrassComponentVersion: state.pipeline.greengrassComponentVersion,
    greengrassDeploymentName: state.pipeline.greengrassDeploymentName,
    greengrassDeploymentTargetType: state.pipeline.greengrassDeploymentTargetType,
    greengrassDeploymentTargetArn : state.pipeline.greengrassDeploymentTargetArn,
    greengrassDeploymentComponents: state.pipeline.greengrassDeploymentComponents
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GreengrassDeploymentForm);