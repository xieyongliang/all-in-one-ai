import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Button, Text, Input, Stack, Select } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';


const optionsInstance : SelectOption[]= [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.t2.medium', value: 'ml.t2.medium' }, 
            { label: 'ml.t2.large', value: 'ml.t2.large' }, 
            { label: 'ml.t2.xlarge', value: 'ml.t2.xlarge' }, 
            { label: 'ml.t2.2xlarge', value: 'ml.t2.2xlarge' }, 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.xlarge', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2xlarge', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4xlarge', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12xlarge', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' },
            { label: 'ml.m5d.large', value: 'ml.m5d.large' }, 
            { label: 'ml.m5d.xlarge', value: 'ml.m5d.xlarge' }, 
            { label: 'ml.m5d.2xlarge', value: 'ml.m5d.2xlarge' }, 
            { label: 'ml.m5d.4xlarge', value: 'ml.m5d.4xlarge' }, 
            { label: 'ml.m5d.12large', value: 'ml.m5d.12large' }, 
            { label: 'ml.m5d.24xlarge', value: 'ml.m5d.24xlarge' }, 
        ]
    },
    {
        label: 'Compute optimized', 
        options: [ 
            { label: 'ml.c5.xlarge', value: 'ml.c5.xlarge' },
            { label: 'ml.c5.2xlarge', value: 'ml.c5.2xlarge' },
            { label: 'ml.c5.4xlarge', value: 'ml.c5.4xlarge' },
            { label: 'ml.c5.9xlarge', value: 'ml.c5.9xlarge' },
            { label: 'ml.c5.18xlarge', value: 'ml.c5.18xlarge' },
            { label: 'ml.c4.large', value: 'ml.c4.large' },
            { label: 'ml.c4.xlarge', value: 'ml.c4.xlarge' },
            { label: 'ml.c4.2xlarge', value: 'ml.c4.2xlarge' },
            { label: 'ml.c4.4xlarge', value: 'ml.c4.4xlarge' },
            { label: 'ml.c4.8xlarge', value: 'ml.c4.8xlarge' },
            { label: 'ml.c5d.large', value: 'ml.c5d.large' },
            { label: 'ml.c5d.xlarge', value: 'ml.c5d.xlarge' },
            { label: 'ml.c5d.2xlarge', value: 'ml.c5d.2xlarge' },
            { label: 'ml.c5d.4xlarge', value: 'ml.c5d.4xlarge' },
            { label: 'ml.c5d.9xlarge', value: 'ml.c5d.9xlarge' },
            { label: 'ml.c5d.18xlarge', value: 'ml.c5d.18xlarge' }
        ]
    },
    {
        label: 'Memory optimized', 
        options: [ 
            { label: 'ml.r5.large', value: 'ml.r5.large' },
            { label: 'ml.r5.xlarge', value: 'ml.r5.xlarge' },
            { label: 'ml.r5.2xlarge', value: 'ml.r5.2xlarge' },
            { label: 'ml.r5.4xlarge', value: 'ml.r5.4xlarge' },
            { label: 'ml.r5.12xlarge', value: 'ml.r5.12xlarge' },
            { label: 'ml.r5.24xlarge', value: 'ml.r5.24xlarge' },
            { label: 'ml.r5d.large', value: 'ml.r5d.large' },
            { label: 'ml.r5d.xlarge', value: 'ml.r5d.xlarge' },
            { label: 'ml.r5d.2xlarge', value: 'ml.r5d.2xlarge' },
            { label: 'ml.r5d.4xlarge', value: 'ml.r5d.4xlarge' },
            { label: 'ml.r5d.12xlarge', value: 'ml.r5d.12xlarge' },
            { label: 'ml.r5d.24xlarge', value: 'ml.r5d.24xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.p3.2xlarge', value: 'ml.p3.2xlarge' },
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge' },
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge' },
            { label: 'ml.g4dn.xlarge', value: 'ml.p4dn.xlarge' },
            { label: 'ml.g4dn.2xlarge', value: 'ml.g4dn.2xlarge' },
            { label: 'ml.g4dn.4xlarge', value: 'ml.g4dn.4xlarge' },
            { label: 'ml.g4dn.8xlarge', value: 'ml.g4dn.8xlarge' },
            { label: 'ml.g4dn.12xlarge', value: 'ml.g4dn.12xlarge' },
            { label: 'ml.g4dn.16xlarge', value: 'ml.g4dn.16xlarge' },
            { label: 'ml.inf1.xlarge', value: 'ml.inf1.xlarge' },
            { label: 'ml.inf1.2xlarge', value: 'ml.inf1.2xlarge' },
            { label: 'ml.inf1.6xlarge', value: 'ml.inf1.6xlarge' },
            { label: 'ml.inf1.24xlarge', value: 'ml.inf1.24xlarge' },
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge' },
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge' },
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge' },
        ]
    }
];

const optionsAcceleratorType : SelectOption[] = [
    { label: 'none', value: '' },
    { label: 'ml.eia1.medium', value: 'ml.eia1.medium' },
    { label: 'ml.eia1.large', value: 'ml.eia1.large' },
    { label: 'ml.eia1.xlarge', value: 'ml.eia1.xlarge' },
    { label: 'ml.eia2.medium', value: 'ml.eia2.medium' },
    { label: 'ml.eia2.large', value: 'ml.eia2.large' },
    { label: 'ml.eia2.xlarge', value: 'ml.eia2.xlarge' },
]

interface PathParams {
    name: string;
}

interface EndpointFormProps {
    wizard?: boolean;
}

const EndpointForm: FunctionComponent<EndpointFormProps> = (props) => {
    const [ optionsModelName, setOptionsModelName ] = useState([])
    const [ endpointName, setEndpointName ] = useState(''); 
    const [ selectedModelName, setSelectedModelName ] = useState<SelectOption>({});
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>({});
    const [ selectedAcceleratorTypeType, setSelectedAcceleratorTypeType ] = useState<SelectOption>({});
    const [ initialInstanceCount, setInitialInstanceCount ] = useState(1);
    const [ initialVariantWeight, setInitialVariantWeight ] = useState<number>(1);
    const [ tags ] = useState([{key:'', value:''}])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidEndpointName, setInvalidEndpointName ] = useState(false)
    const [ invalidModelName, setInvalidModelName ] = useState(false);
    const [ invalidInstanceType, setInvalidInstanceType ] = useState(false);
    const [ invalidAcceleratorTypeType, setInvalidAcceleratorTypeType ] = useState(false);
    const [ invalidInitialInstanceCount, setInvalidInitialInstanceCount ] = useState(false);
    const [ invalidInitialVariantWeight, setInvalidInitialVariantWeight ] = useState(false);

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        axios.get('/model')
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({label: item.model_name, value: item.model_name})
            }
            setOptionsModelName(items);
            console.log(items);
        }, (error) => {
            console.log(error);
        });
    }, [])

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdEndpointName')
            setEndpointName(event)
        if(id === 'formFieldIdModelName')
            setSelectedModelName({label: event.target.value, value: event.target.value});
        if(id === 'formFieldIdInstanceType')
            setSelectedInstanceType({label: event.target.value, value: event.target.value});
        if(id === 'formFieldIdAcceleratorType')
            setSelectedAcceleratorTypeType({label: event.target.value, value: event.target.value});
        if(id === 'formFieldIdInitialInstanceCount')
            setInitialInstanceCount(parseInt(event))
        if(id === 'formFieldIdInitialVariantWeight')
            setInitialVariantWeight(parseFloat(event))
    }

    const onSubmit = () => {
        if(endpointName === '')
            setInvalidEndpointName(true)
        else if(selectedModelName.value === undefined)
            setInvalidModelName(true)
        else if(selectedInstanceType.value === undefined)
            setInvalidInstanceType(true)
        else if(selectedAcceleratorTypeType.value === undefined)
            setInvalidAcceleratorTypeType(true)        
        else if(initialInstanceCount <= 0 )
            setInvalidInitialInstanceCount(true)
        else if(initialVariantWeight <= 0)
            setInvalidInitialVariantWeight(true)
        else {
            var body = {
                'endpoint_name': endpointName,
                'model_name' : selectedModelName.value,
                'case_name': params.name,
                'instance_type': selectedInstanceType.value,
                'accelerator_type': selectedAcceleratorTypeType.value,
                'initial_instance_count': initialInstanceCount,
                'initial_variant_weight': initialVariantWeight
            }
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body['tags'] = tags
            axios.post('/endpoint', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=model`)
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });
        }
    }

    const onCancel = () => {
        history.push('/case/' + params.name + '?tab=endpoint')
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

    const renderEndpointSetting = () => {
        if(!wizard) {
            return (
                <FormSection header="Endpoint setting">
                    <FormField label="Endpooint name" description='Your application uses this name to access this endpoint.' controlId="formFieldIdEndpointName" hintText='Maximum of 63 alphanumeric characters. Can include hyphens (-), but not spaces. Must be unique within your account in an AWS Region.'>
                        <Input type="text" value={endpointName} invalid={invalidEndpointName} onChange={(event) => {onChange('formFieldIdEndpointName', event)}} />
                    </FormField>
                </FormSection>
            )
        }
        else 
            return ''
    }

    const renderEndpointTag = () => {
        if(!wizard) {
            return (
                <FormSection header="Tags - optional">
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
                                    <Input type="text" value={tag.key}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type="text" value={tag.value}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant="link" size="large" onClick={onAddTag}>Add tag</Button>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderEndpointFormContent = () => {
        return (
            <FormSection header="Production variants">
                <FormField label="Model name" controlId="formFieldIdModel">
                    <Select
                            placeholder="Choose an option"
                            options={optionsModelName}
                            selectedOption={selectedModelName}
                            invalid={invalidModelName}
                            onChange={(event) => onChange('formFieldIdModelName', event)}
                        />
                </FormField>
                <FormField label="Instance type" controlId="formFieldIdInstanceType">
                    <Select
                            placeholder="Choose an option"
                            options={optionsInstance}
                            selectedOption={selectedInstanceType}
                            invalid={invalidInstanceType}
                            onChange={(event) => onChange('formFieldIdInstanceType', event)}
                        />
                </FormField>
                <FormField label="Elastic Inference" controlId="formFieldIdAcceleratorType">
                    <Select
                            placeholder="Choose an option"
                            options={optionsAcceleratorType}
                            selectedOption={selectedAcceleratorTypeType}
                            invalid={invalidAcceleratorTypeType}
                            onChange={(event) => onChange('formFieldIdAcceleratorType', event)}
                        />
                </FormField>
                <FormField label="Initial instance count" controlId="formFieldIdInitialInstanceCount">
                    <Input type="text" value={initialInstanceCount} invalid={invalidInitialInstanceCount} onChange={(event) => {onChange('formFieldIdInitialInstanceCount', event)}} />
                </FormField>
                <FormField label="Initial weight" controlId="formFieldIdInitialVariantWeight">
                    <Input type="text" value={initialVariantWeight} invalid={invalidInitialVariantWeight} onChange={(event) => {onChange('formFieldIdInitialVariantWeight', event)}} />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderEndpointSetting()}
                {renderEndpointFormContent()}
                {renderEndpointTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create endpoint"
                description="To deploy models to Amazon SageMaker, first create an endpoint. Specify which models to deploy, and the relative traffic weighting and hardware requirements for each. "
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }>
                {renderEndpointSetting()}
                {renderEndpointFormContent()}
                {renderEndpointTag()}
            </Form>
        )
    }
}

export default EndpointForm;