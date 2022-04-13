import { FunctionComponent, useState, useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import {Column} from 'react-table'
import { Form, FormSection, FormField, Input, Button, Text, Stack, RadioButton, RadioGroup, Table, ExpandableSection, Select } from 'aws-northstar';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { UpdateModelModelPackageGroupName, UpdateModelModelPackageArn, UpdateModelDataUrl } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';
import { getUtcDate } from '../../Utils/Helper';

interface ModelPackageItem {
    name: string;
    versions: string[];
    creation_time: string;
}

interface IProps {
    updateModelModelPackageGroupNameAction : (modelModelPackageGroupName: string) => any;
    updateModelModelPackageArnAction : (modelModelPackageArn: string) => any;
    updateModelDataUrlAction: (modelDataUrl: string) => any;
    pipelineType: string;
    modelModelPackageGroupName: string;
    modelModelPackageArn: string;
    modelDataUrl: string;
    modelAlgorithm: string;
    industrialModels : IIndustrialModel[];
    wizard?: boolean;
}

const ModelForm: FunctionComponent<IProps> = (props) => {
    const [ modelPackageGroupItems, setModelPackageGroupItems ] = useState([])
    const [ modelPackageVersionItems, setModelPackageVersionItems ] = useState({})
    const [ modelPackageGroupName, setModelPackageGroupName ] = useState('')
    const [ loading, setLoading ] = useState(true);
    const [ modelName, setModelName ] = useState('')
    const [ containerIamge, setContainerImage ] = useState('')
    const [ modelDataUrl, setModelDataUrl ] = useState('')
    const [ containerInputType, setContainerInputType ] = useState(props.wizard  ? '1' : '0')
    const [ containerModelType, setContainerModelType ] = useState('SingleModel')
    const [ selectedModelPackage, setSelectedModelPackage ] = useState({});
    const [ selectedModelPackageVersions, setSelectedModelPackageVersions ] = useState([]);
    const [ tags, setTags ] = useState([{key:'', value:''}])
    const [ environment, setEnvironment ] = useState([{key:'', value:''}])
    const [ invalidModelName, setInvalidModelName ] = useState(false)
    const [ invalidModelDataUrl, setInvalidModelDataUrl ] = useState(false)
    const [ invalidModelPackageName, setInvalidModelPackageName ] = useState(false)
    const [ processing, setProcessing ] = useState(false)
    const [ processingModelPackage, setProcessingModelPackage ] = useState(false);
    const [ processingModelPackageGroup, setProcessingModelPackageGroup ] = useState(false);

    const history = useHistory();

    var params : PathParams = useParams();

    async function getModelPackageGruop() {
        const response = await axios.get(`/modelpackage/group`)
        return response.data
    }

    async function getModelPackageVersions(modelPackageGroupName) {
        const response = await axios.get(`/modelpackage/${modelPackageGroupName}`)
        return response.data
    }

    async function getModelPackage(modelPackageGroupName, modelPackageArn) {
        const response = await axios.get(`/modelpackage/${modelPackageGroupName}`, {params: {model_package_arn: modelPackageArn}})
        return response.data
    }    

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    useEffect(() => {
        getModelPackageGruop().then((data) => {
            var modelPackageGroupItems = []
            var modelPackageVersionItems = {}
            for(let item of data) {
                getModelPackageVersions(item.ModelPackageGroupName).then(value => {
                    var versions = []
                    var arns = []
                    value.forEach(modelPackage => {
                        versions.push(modelPackage['ModelPackageVersion'])
                        arns.push(modelPackage['ModelPackageArn'])
                    })
                    modelPackageGroupItems.find(({name}) => name === item.ModelPackageGroupName)['versions'] = versions
                    modelPackageVersionItems[item.ModelPackageGroupName] = {
                        versions: versions,
                        arns: arns
                    }
                    if(Object.keys(modelPackageVersionItems).length === data.length) {
                        setModelPackageVersionItems(modelPackageVersionItems)
                        setLoading(false)
                    }
                })
                modelPackageGroupItems.push({name: item.ModelPackageGroupName, creation_time: getUtcDate(item.CreationTime), versions: []})
                if(Object.keys(modelPackageGroupItems).length === data.length) {
                    setModelPackageGroupItems(modelPackageGroupItems)
                }
            }
        }, (error) => {
            console.log(error);
        });
    }, [])

    const onChange = (id: string, event: any, option?: string) => {
        if(id === 'formFieldIdModelName')
            setModelName(event);
        else if(id === 'formFieldIdContainerImage')
            setContainerImage(event)
        else if(id === 'formFieldIdModelDataUrl')
            setModelDataUrl(event)
        else if(id === 'formFieldIdMode')
            setContainerModelType(event)
        else if(id === 'formFieldIdModelPackageGroup')
            setModelPackageGroupName(event)
        else if(option === 'versions') {
            var copySelectedModelPackageVersions = JSON.parse(JSON.stringify(selectedModelPackageVersions));
            copySelectedModelPackageVersions[id] = {label: event.target.value, value: event.target.value};
            setSelectedModelPackageVersions(copySelectedModelPackageVersions)
        }
    }

    const onChangeEnvironment = (id: string, event: any, index : number) => {
        var copyEnvironment = JSON.parse(JSON.stringify(environment));
        copyEnvironment[index][id] = event
        setEnvironment(copyEnvironment)
    }

    const onChangeOptions = (event, value) => {
        if(value === '0' || value === '1')
            setContainerInputType(value)
        else
            setContainerModelType(value)
    }
 
    const onSelectionChange = (selectedItems: ModelPackageItem[]) => {
        selectedItems.forEach((selectedItem) => {
            setSelectedModelPackage(selectedItem)
            if(wizard) {
                var modelPackageGroupName = selectedItem.name
                props.updateModelModelPackageGroupNameAction(modelPackageGroupName)
                if(selectedModelPackageVersions[modelPackageGroupName] !==  undefined) {
                    var modelPakcageVersion = selectedModelPackageVersions[modelPackageGroupName]['value']
                    var index = modelPackageVersionItems[selectedItem.name]['versions'].findIndex((version) => version === modelPakcageVersion)
                    var modelPackageArn = modelPackageVersionItems[modelPackageGroupName]['arns'][index]
                    props.updateModelModelPackageArnAction(modelPackageArn)
                    getModelPackage(modelPackageGroupName, modelPackageArn).then((data) => {
                        props.updateModelDataUrlAction(data.InferenceSpecification.Containers[0].ModelDataUrl)
                    })
                }
            }
        })
    }

    const onSubmit = () => {
        var body = {}
        var index = props.industrialModels.findIndex((item) => item.id === params.id)
        var algorithm = props.industrialModels[index].algorithm

        if(containerInputType === '0'){
            if(modelName === '')
                setInvalidModelName(true)
            else if(modelDataUrl === '')
                setInvalidModelDataUrl(true)
            else {
                body = {
                    'model_name' : modelName,
                    'industrial_model': params.id,
                    'model_algorithm': algorithm,
                    'container_image': containerIamge,
                    'model_data_url': modelDataUrl,
                    'mode': containerModelType
                }
                if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                    body['tags'] = tags;
                if(environment.length > 0) {
                    body['environment'] = {};
                    environment.forEach((item) => {
                        if(item['key'] === '') {
                            alert('key in environment variables cannot be empty');
                            return;
                        }
                        body['environment'][item['key']] = item['value'];
                    })
                }
                setProcessing(true)
                axios.post('/model', body,  { headers: {'content-type': 'application/json' }}) 
                    .then((response) => {
                        history.goBack()
                    }, (error) => {
                        alert('Error occured, please check and try it again');
                        console.log(error);
                        setProcessing(false)
                    });
            }
        }
        else if(containerInputType === '1') {
            if(modelName === '')
                setInvalidModelName(true)
            else {
                var model_package_group_name = selectedModelPackage['name']
                var model_package_version = selectedModelPackageVersions[model_package_group_name]['value']
                index = modelPackageVersionItems[model_package_group_name]['versions'].findIndex((version) => version === model_package_version)
                var model_package_arn = modelPackageVersionItems[model_package_group_name]['arns'][index]
                body = {
                    'model_name' : modelName,
                    'industrial_model': params.id,
                    'model_algorithm': algorithm,
                    'model_package_arn': model_package_arn
                }
                if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                    body['tags'] = tags
                setProcessing(true)
                axios.post('/model', body,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                    alert('Error occured, please check and try it again');
                    console.log(error);
                    setProcessing(false)
                });
            }
        }
    }
 
    const onCancel = () => {
        history.goBack()
    }

    const onAddTag = () => {
        var copyTags = JSON.parse(JSON.stringify(tags));
        copyTags.push({key:'', value:''});
        setTags(copyTags);
    }

    const onRemoveTag = (index) => {
        var copyTags = JSON.parse(JSON.stringify(tags));
        copyTags.splice(index, 1);
        setTags(copyTags);
    }

    const renderModelSetting = () => {
        if(!wizard) {
            return (
                <FormSection header='Model settings'>
                    <FormField label='Model name' controlId='formFieldIdModelName'>
                        <Input type='text' required={true} value={modelName} invalid={invalidModelName} onChange={(event)=>onChange('formFieldIdModelName', event)}/>
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const onChangeTags = (id: string, event: any, index : number) => {
        var copyTags = JSON.parse(JSON.stringify(tags));
        copyTags[index][id] = event
        setTags(copyTags)
    }    

    const renderModelTags = () => {
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
                                    <Input type='text' value={tag.key} onChange={(event) => onChangeTags('key', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={tag.value} onChange={(event) => onChangeTags('value', event, index)}/>
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

    const renderContainerInputOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='0' checked={containerInputType === '0'}>Provide model artifacts and inference image location.</RadioButton>, 
                    <RadioButton value='1' checked={containerInputType === '1'}>Select a model package resource.</RadioButton>,
                ]}
            />
        )
    }

    const renderContainerModelOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='SingleModel' checked={containerModelType === 'SingleModel'}>Use a single model.</RadioButton>, 
                    <RadioButton value='MultiModel' checked={containerModelType === 'MultiModel'}>Use multiple models.</RadioButton>,
                ]}
            />
        )
    }

    const getRowId = useCallback(data => data.name, []);

    const columnDefinitions : Column<ModelPackageItem>[]= [
        {
            id: 'name',
            width: 400,
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/industrialmodel/${params.id}?tab=modelpackage#prop:id=${row.original.name}`}> {row.original.name} </a>;
                }
                return null;
            }
        },
        {
            id: 'version',
            width: 400,
            Header: 'Version',
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
                            selectedOption={selectedModelPackageVersions[row.original.name]}
                            onChange={(event) => onChange(row.original.name, event, 'versions')}
                            disabled={wizard && (props.pipelineType === '0' || props.pipelineType === '1')}
                        />
                    )
                }
                return null;
            }
        }
        ,
        {
            id: 'creation_time',
            width: 400,
            Header: 'Creation time',
            accessor: 'creation_time'
        }
    ];

    const renderModelPackageTable = () => {
        if(wizard)
            return (
                <Table
                    tableTitle='Model packages'
                    multiSelect={false}
                    columnDefinitions={columnDefinitions}
                    items={modelPackageGroupItems}
                    loading={loading}
                    selectedRowIds={[props.modelModelPackageGroupName]}
                    onSelectionChange={onSelectionChange}
                    getRowId={getRowId}
                />
            )
        else
            return (
                <Table
                    tableTitle='Model packages'
                    multiSelect={false}
                    columnDefinitions={columnDefinitions}
                    items={modelPackageGroupItems}
                    loading={loading}
                    onSelectionChange={onSelectionChange}
                    getRowId={getRowId}
                />
            )
    }

    const onCreateModelPackageGroup = () => {
        if(modelPackageGroupName === '')
            setInvalidModelPackageName(true)
        else{
            var body = {
                'model_package_group_name': modelPackageGroupName
            }
            setProcessingModelPackageGroup(true)
            axios.post('/modelpackage/group', body,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    var copyModelPackageGroupItems = JSON.parse(JSON.stringify(modelPackageGroupItems))
                    copyModelPackageGroupItems.push({name: modelPackageGroupName, creation_time: response.data.creation_time, versions: []})
                    copyModelPackageGroupItems[modelPackageGroupName] = {
                        versions: [],
                        arns: []
                    }
                    setModelPackageGroupItems(copyModelPackageGroupItems)
                    setProcessingModelPackageGroup(false);
                }, (error) => {
                    alert('Error occured, please check and try it again');
                    console.log(error);
                    setProcessingModelPackageGroup(false);
                }
            );
        }
    }

    const renderModelPackageGroupForm = () => {
        return (
            <Stack>
                <FormField label='Name of model package group' controlId='formFieldIdModelPackageGroup'>
                    <Input type='text' required={true} value={modelPackageGroupName} invalid={invalidModelPackageName} onChange={(event)=>{onChange('formFieldIdModelPackageGroup', event)}} />
                </FormField>
                <FormField controlId='formfieldIdCreateModelPackageGroup'>
                    <Button onClick={onCreateModelPackageGroup} loading={processingModelPackageGroup}>Create model package group</Button>
                </FormField>
            </Stack>
        )
    }

    const onCreateModelPackage = () => {
        if(modelDataUrl === '')
            setInvalidModelDataUrl(true)
        else{
            var algorithm;
            if(!wizard) {
                var index = props.industrialModels.findIndex((item) => item.id === params.id)
                algorithm = props.industrialModels[index].algorithm
            } else {
                algorithm = props.modelAlgorithm
            }

            var body = {
                'model_algorithm': algorithm,
                'container_image': containerIamge,
                'model_data_url': modelDataUrl,
                'supported_content_types': 'image/png;image/jpg;image/jpeg',
                'supported_response_mime_types': 'application/json'
            }
            setProcessingModelPackage(true)
            axios.post(`/modelpackage/${selectedModelPackage['name']}`, body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                getModelPackageVersions(selectedModelPackage['name']).then(value => {
                    var versions = []
                    var arns = []
                    value.forEach(modelPackage => {
                        versions.push(modelPackage['ModelPackageVersion'])
                        arns.push(modelPackage['ModelPackageArn'])
                    })
                    var copyModelPackageGroupItems = JSON.parse(JSON.stringify(modelPackageGroupItems))
                    copyModelPackageGroupItems.find(({name}) => name === selectedModelPackage['name'])['versions'] = versions
                    copyModelPackageGroupItems[selectedModelPackage['name']] = {
                        versions: versions,
                        arns: arns
                    }
                    setModelPackageGroupItems(copyModelPackageGroupItems)
                    setProcessingModelPackage(false);
                })                
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessingModelPackage(false)
            });
        }
    }

    const renderModelPackageForm = () => {
        return (
            <Stack>
                <FormField label='Location of inference code image' description='Type the registry path where the inference code image is stored in Amazon ECR.' controlId='formFieldIdContainerImage'>
                    <Input type='text' required={true} value={containerIamge} placeholder={'default'} onChange={(event)=>{onChange('formFieldIdContainerImage', event)}} />
                </FormField>
                <FormField label='Location of model artifacts' description='Type the URL where model artifacts are stored in S3.' controlId='formFieldIdModelDataUrl'>
                    <Input type='text' required={true} value={modelDataUrl} invalid={invalidModelDataUrl} onChange={(event)=>{onChange('formFieldIdModelDataUrl', event)}} />
                </FormField>
                <FormField controlId='formfieldIdCreateModelPackage'>
                    <Button onClick={onCreateModelPackage} loading={processingModelPackage}>Create model package</Button>
                </FormField>
            </Stack>
        )
    }

    const onAddEnvironmentVairable = () => {
        var copyEnvironmentVaraibles = JSON.parse(JSON.stringify(environment));
        copyEnvironmentVaraibles.push({key:'', value:''});
        setEnvironment(copyEnvironmentVaraibles);
    }

    const onRemoveEnvironmentVariable = (index) => {
        var copyEnvironmentVaraibles = JSON.parse(JSON.stringify(environment));
        copyEnvironmentVaraibles.splice(index, 1);
        setEnvironment(copyEnvironmentVaraibles);
    }

    const renderEnvironment = () => {
        return (
            <ExpandableSection header="Environment variables - optional">
                <Stack>
                    {
                        environment.length>0 && 
                        <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text> Key </Text>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text> Value </Text> 
                            </Grid>
                        </Grid>
                    }
                    {
                        environment.map((item, index) => (
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={item.key} onChange={(event) => onChangeEnvironment('key', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={item.value} onChange={(event) => onChangeEnvironment('value', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveEnvironmentVariable(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant='link' size='large' onClick={onAddEnvironmentVairable}>Add environment variable</Button>
                </Stack>
            </ExpandableSection>  
        )
    }

    const renderModelFormContent = () => {
        if(containerInputType === '0')
            return (
                <FormSection header='Container definition'>
                    <ExpandableSection header="Container input options" expanded={true}>{renderContainerInputOptions()}</ExpandableSection>  
                    <ExpandableSection header="Provide model artifacts and inference image options" expanded={true}>
                        <Stack>
                            <FormField controlId='formFieldIdContainerModelOptions'>
                                {renderContainerModelOptions()}
                            </FormField>
                            <FormField label='Location of inference code image' description='Type the registry path where the inference code image is stored in Amazon ECR.' controlId='formFieldIdContainerImage'>
                                <Input type='text' required={true} value={containerIamge} placeholder={'default'} onChange={(event)=>{onChange('formFieldIdContainerImage', event)}} />
                            </FormField>
                            <FormField label='Location of model artifacts' description='Type the URL where model artifacts are stored in S3.' controlId='formFieldIdModelDataUrl'>
                                <Input type='text' required={true} value={modelDataUrl} invalid={invalidModelDataUrl} onChange={(event)=>{onChange('formFieldIdModelDataUrl', event)}} />
                            </FormField>
                        </Stack>
                    </ExpandableSection>
                    {
                        renderEnvironment()
                    }
                </FormSection>    
            )
        else
            return (
                <FormSection header='Container definition'>
                    {
                        !wizard && 
                        <ExpandableSection header="Container input options" expanded={true}>{renderContainerInputOptions()}</ExpandableSection> 
                    }
                    {renderModelPackageTable()}
                    <ExpandableSection header="Create a new model package group">{renderModelPackageGroupForm()}</ExpandableSection>
                    {
                        (props.pipelineType === '2' || props.pipelineType === '3') &&
                        <ExpandableSection header="Create a new model package">{renderModelPackageForm()}</ExpandableSection>
                    }
                    {
                        renderEnvironment()
                    }
                </FormSection>
            )
    }

    if(wizard) {
        return (
            <Stack>
                {renderModelSetting()}
                {renderModelFormContent()}
                {renderModelTags()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header='Create model'
                description='To deploy a model to Amazon SageMaker, first create the model by providing the location of the model artifacts and inference code.'
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
                    </div>
                }>            
                {renderModelSetting()}
                {renderModelFormContent()}
                {renderModelTags()}
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateModelModelPackageGroupNameAction: UpdateModelModelPackageGroupName,
    updateModelModelPackageArnAction: UpdateModelModelPackageArn,
    updateModelDataUrlAction: UpdateModelDataUrl
};

const mapStateToProps = (state: AppState) => ({
    pipelineType: state.pipeline.pipelineType,
    modelModelPackageGroupName : state.pipeline.modelModelPackageGroupName,
    modelModelPackageArn: state.pipeline.modelModelPackageArn,
    modelDataUrl: state.pipeline.modelDataUrl,
    modelAlgorithm: state.pipeline.modelAlgorithm,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ModelForm);
