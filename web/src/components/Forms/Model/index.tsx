import { FunctionComponent, useState, useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import {Column} from 'react-table'
import { Form, FormSection, FormField, Input, Button, Text, Stack, RadioButton, RadioGroup, Table, ExpandableSection, Select } from 'aws-northstar';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { UpdateModelModelPackageGroupName } from '../../../store/pipelines/actionCreators';

interface PathParams {
    name: string;
}

interface ModelPackageItem {
    name: string;
    versions: string[];
    creation_time: string;
}

interface IProps {
    updateModelModelPackageGroupNameAction : (modelModelPackageGroupName: string) => any;
    modelModelPackageGroupName: string;
    wizard?: boolean;
}

const ModelForm: FunctionComponent<IProps> = (props) => {
    const [ itemsModelPackageGroups ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ modelName, setModelName ] = useState('')
    const [ containerIamge, setContainerImage ] = useState('')
    const [ modelDataUrl, setModelDataUrl ] = useState('')
    const [ containerInputType, setContainerInputType ] = useState('0')
    const [ containerModelType, setContainerModelType ] = useState('SingleModel')
    const [ selectedModelPackage, setSelectedModelPackage ] = useState({});
    const [ selectedModelPackageVersions ] = useState([]);
    const [ itemsModelPackageVersions ] = useState({})
    const [ modelPackageGroupName, setModelPackageGroupName ] = useState('')
    const [ tags ] = useState([{key:'', value:''}])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidModelName, setInvalidModelName ] = useState(false)
    const [ invalidModelDataUrl, setInvalidModelDataUrl ] = useState(false)
    const [ invalidModelPackageName, setInvalidModelPackageName ] = useState(false)
    const [ forceRefreshed, setForceRefreshed ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    async function getModelPackageVersions(modelPackageGroupName) {
        const response = await axios.get(`/modelpackage/${modelPackageGroupName}`)
        return response.data
    }

    useEffect(() => {
        axios.get('/modelpackage/group')
            .then((response) => {
            for(let item of response.data) {
                getModelPackageVersions(item.ModelPackageGroupName).then(value => {
                    var versions = []
                    var arns = []
                    value.forEach(modelPackage => {
                        versions.push(modelPackage['ModelPackageVersion'])
                        arns.push(modelPackage['ModelPackageArn'])
                    })
                    itemsModelPackageGroups.find(({name}) => name === item.ModelPackageGroupName)['versions'] = versions
                    itemsModelPackageVersions[item.ModelPackageGroupName] = {
                        versions: versions,
                        arns: arns
                    }
                })
                itemsModelPackageGroups.push({name: item.ModelPackageGroupName, creation_time: item.CreationTime, versions: []})
            }
            setLoading(false)
        }, (error) => {
            console.log(error);
        });
    }, [itemsModelPackageGroups, itemsModelPackageVersions, props])

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
            selectedModelPackageVersions[id] = {label: event.target.value, value: event.target.value};
            setForceRefreshed(!forceRefreshed)
        }
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
            if(props.wizard)
                props.updateModelModelPackageGroupNameAction(selectedItem.name)
            console.log(props.modelModelPackageGroupName)
        })
    }

    const onSubmit = () => {
        var body = {}
        if(containerInputType === '0'){
            if(modelName === '')
                setInvalidModelName(true)
            else if(modelDataUrl === '')
                setInvalidModelDataUrl(true)
            else {
                body = {
                    'model_name' : modelName,
                    'case_name': params.name,
                    'container_image': containerIamge,
                    'model_data_url': modelDataUrl,
                    'mode': containerModelType
                }
                if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                    body['tags'] = tags
                axios.post('/model', body,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                    alert('Error occured, please check and try it again');
                    console.log(error);
                });
            }
        }
        else if(containerInputType === '1') {
            if(modelName === '')
                setInvalidModelName(true)
            else {
                var model_package_group_name = selectedModelPackage['name']
                var model_package_version = selectedModelPackageVersions[model_package_group_name]['value']
                var index = itemsModelPackageVersions[model_package_group_name]['versions'].findIndex((version) => version === model_package_version)
                var model_package_arn = itemsModelPackageVersions[model_package_group_name]['arns'][index]
                body = {
                    'model_name' : modelName,
                    'case_name': params.name,
                    'model_package_arn': model_package_arn
                }
                console.log(body)         
                if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                    body['tags'] = tags
                axios.post('/model', body,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                    alert('Error occured, please check and try it again');
                    console.log(error);
                });
            }
        }
    }
 
    const onCancel = () => {
        history.goBack()
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

    const renderModelTag = () => {
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
                    return <a href={`/case/${params.name}?tab=modelpackage#prop:id=${row.original.name}`}> {row.original.name} </a>;
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
                            selectedOption={selectedModelPackageVersions[row.original.name]}
                            onChange={(event) => onChange(row.original.name, event, 'versions')}
                        />
                    )
                }
                return null;
            }
        },
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
                    items={itemsModelPackageGroups}
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
                items={itemsModelPackageGroups}
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
            axios.post('/modelpackage/group', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                itemsModelPackageGroups.push({name: modelPackageGroupName, creation_time: response.data.creation_time, versions: []})
                itemsModelPackageVersions[modelPackageGroupName] = {
                    versions: [],
                    arns: []
                }
                setForcedRefresh(!forcedRefresh);
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });
        }
    }

    const renderModelPackageGroupForm = () => {
        return (
            <Stack>
                <FormField label='Name of model package group' controlId='formFieldIdModelPackageGroup'>
                    <Input type='text' required={true} value={modelPackageGroupName} invalid={invalidModelPackageName} onChange={(event)=>{onChange('formFieldIdModelPackageGroup', event)}} />
                </FormField>
                <FormField controlId='formfieldIdCreateModelPackageGroup'>
                    <Button onClick={onCreateModelPackageGroup}>Create model package group</Button>
                </FormField>
            </Stack>
        )
    }

    const onCreateModelPackage = () => {
        if(modelDataUrl === '')
            setInvalidModelDataUrl(true)
        else{
            var body = {
                'container_image': containerIamge,
                'model_data_url': modelDataUrl,
                'supported_content_types': 'image/png image/jpg image/jpeg',
                'supported_response_mime_types': 'application/json'
            }
            axios.post(`/modelpackage/${selectedModelPackage['name']}`, body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                console.log(response.data)
                getModelPackageVersions(selectedModelPackage['name']).then(value => {
                    var versions = []
                    var arns = []
                    value.forEach(modelPackage => {
                        versions.push(modelPackage['ModelPackageVersion'])
                        arns.push(modelPackage['ModelPackageArn'])
                    })
                    itemsModelPackageGroups.find(({name}) => name === selectedModelPackage['name'])['versions'] = versions
                    itemsModelPackageVersions[selectedModelPackage['name']] = {
                        versions: versions,
                        arns: arns
                    }
                    setForcedRefresh(!forcedRefresh);
                })                
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
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
                    <Button onClick={onCreateModelPackage}>Create model package</Button>
                </FormField>
            </Stack>
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
                </FormSection>    
            )
        else
            return (
                <FormSection header='Container definition'>
                    <ExpandableSection header="Container input options" expanded={true}>{renderContainerInputOptions()}</ExpandableSection>  
                    {renderModelPackageTable()}
                    <ExpandableSection header="Create a new model package group">{renderModelPackageGroupForm()}</ExpandableSection>
                    <ExpandableSection header="Create a new model package">{renderModelPackageForm()}</ExpandableSection>
                </FormSection>
            )
    }

    if(wizard) {
        return (
            <Stack>
                {renderModelSetting()}
                {renderModelPackageTable()}
                {renderModelPackageGroupForm()}
                {renderModelTag()}
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
                        <Button variant='primary' onClick={onSubmit}>Submit</Button>
                    </div>
                }>            
                {renderModelSetting()}
                {renderModelFormContent()}
                {renderModelTag()}
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateModelModelPackageGroupNameAction: UpdateModelModelPackageGroupName,
};

const mapStateToProps = (state: AppState) => ({
    modelModelPackageGroupName : state.pipeline.modelModelPackageGroupName
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ModelForm);