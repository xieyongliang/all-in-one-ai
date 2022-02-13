import Wizard from 'aws-northstar/components/Wizard';
import { BrowserRouter, useHistory, useParams } from 'react-router-dom';
import FormField from 'aws-northstar/components/FormField'
import Input from 'aws-northstar/components/Input';
import Container from 'aws-northstar/layouts/Container';
import { ChangeEvent, FunctionComponent, useState } from 'react';
import { RadioButton, RadioGroup, Stack } from 'aws-northstar';
import TrainingJobForm from '../TrainingJob';
import ModelForm from '../Model';
import EndpointForm from '../Endpoint';
import RestApiForm from '../RestApi';
import GreengrassComponentForm from '../GreengrassComponent';
import GreengrassDeploymentForm from '../GreengrassDeployment';

interface PathParams {
    name: string;
}

interface PipelineFormProps {
    wizard?: boolean;
}

const PipelineForm: FunctionComponent<PipelineFormProps> = (props) => {
    const [stateType, setStateType] = useState('0')

    const onChange = (event?: ChangeEvent<HTMLInputElement>, value?: string)=>{
        var option : string = value || ''
        setStateType(option)
    }
    
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const onSubmit = () => {
        history.push('/case/' + name + '/pipeline')
    }

    const onCancel = () => {
        history.push('/case/' + name + '/pipeline')
    }

    const steps = [
        {
            title: 'Pipeline',
            content: 
                <Stack>
                <FormField label="Pipeline name" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Pipeline type" controlId="formFieldId2">
                    <RadioGroup onChange={onChange}
                            items={[
                                <RadioButton value='0' checked={stateType === '0'}>Both trining and inference and deploy in both cloud and edge</RadioButton>, 
                                <RadioButton value='1' checked={stateType === '1'}>Both training and inference and deploy only in cloud</RadioButton>,                
                                <RadioButton value='2' checked={stateType === '2'}>Only inference and deploy in both cloud and edge</RadioButton>,                
                                <RadioButton value='3' checked={stateType === '3'}>Only inference and deploy only in cloud</RadioButton>                
                            ]}
                        />
                </FormField>
                </Stack>
        },
        {
            title: 'Training job',
            content: 
                <Stack>
                    <TrainingJobForm wizard={true}/>
                </Stack>            
        },
        {
            title: 'Model',
            content: 
                <Stack>
                    <ModelForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Endpoint',
            content: 
                <Stack>
                    <EndpointForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Rest API',
            content: 
                <Stack>
                    <RestApiForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Greengrass component',
            content: 
                <Stack>
                    <GreengrassComponentForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Greengrass deployment',
            content: 
                <Stack>
                    <GreengrassDeploymentForm wizard={true}/>
                </Stack>
        }
    ];

    const steps1 = [
        {
            title: 'Pipeline',
            content: 
                <Stack>
                <FormField label="Pipeline name" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Pipeline type" controlId="formFieldId2">
                    <RadioGroup onChange={onChange}
                            items={[
                                <RadioButton value='0' checked={stateType === '0'}>Both trining and inference and deploy in both cloud and edge</RadioButton>, 
                                <RadioButton value='1' checked={stateType === '1'}>Both training and inference and deploy only in cloud</RadioButton>,                
                                <RadioButton value='2' checked={stateType === '2'}>Only inference and deploy in both cloud and edge</RadioButton>,                
                                <RadioButton value='3' checked={stateType === '3'}>Only inference and deploy only in cloud</RadioButton>                
                            ]}
                        />
                </FormField>
                </Stack>
        },
        {
            title: 'Pipeline',
            content: 
                <Stack>
                <FormField label="Pipeline name" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Pipeline type" controlId="formFieldId2">
                    <RadioGroup onChange={onChange}
                            items={[
                                <RadioButton value='0' checked={stateType === '0'}>Both trining and inference and deploy in both cloud and edge</RadioButton>, 
                                <RadioButton value='1' checked={stateType === '1'}>Both training and inference and deploy only in cloud</RadioButton>,                
                                <RadioButton value='2' checked={stateType === '2'}>Only inference and deploy in both cloud and edge</RadioButton>,                
                                <RadioButton value='3' checked={stateType === '3'}>Only inference and deploy only in cloud</RadioButton>                
                            ]}
                        />
                </FormField>
                </Stack>
        },
        {
            title: 'Training job',
            content: 
                <Stack>
                    <TrainingJobForm wizard={true}/>
                </Stack>            
        },
        {
            title: 'Model',
            content: 
                <Stack>
                    <ModelForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Endpoint',
            content: 
                <Stack>
                    <EndpointForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Rest API',
            content: 
                <Stack>
                    <RestApiForm wizard={true}/>
                </Stack>
        }    
    ]

    const steps2 = [
        {
            title: 'Pipeline',
            content: 
                <Stack>
                <FormField label="Pipeline name" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Pipeline type" controlId="formFieldId2">
                    <RadioGroup onChange={onChange}
                            items={[
                                <RadioButton value='0' checked={stateType === '0'}>Both trining and inference and deploy in both cloud and edge</RadioButton>, 
                                <RadioButton value='1' checked={stateType === '1'}>Both training and inference and deploy only in cloud</RadioButton>,                
                                <RadioButton value='2' checked={stateType === '2'}>Only inference and deploy in both cloud and edge</RadioButton>,                
                                <RadioButton value='3' checked={stateType === '3'}>Only inference and deploy only in cloud</RadioButton>                
                            ]}
                        />
                </FormField>
                </Stack>
        },
        {
            title: 'Model',
            content: 
                <Stack>
                    <ModelForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Endpoint',
            content: 
                <Stack>
                    <EndpointForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Rest API',
            content: 
                <Stack>
                    <RestApiForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Greengrass component',
            content: 
                <Stack>
                    <GreengrassComponentForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Greengrass deployment',
            content: 
                <Stack>
                    <GreengrassDeploymentForm wizard={true}/>
                </Stack>
        }    
    ]
    
    const steps3 = [
        {
            title: 'Pipeline',
            content: 
                <Stack>
                <FormField label="Pipeline name" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Pipeline type" controlId="formFieldId2">
                    <RadioGroup onChange={onChange}
                            items={[
                                <RadioButton value='0' checked={stateType === '0'}>Both trining and inference and deploy in both cloud and edge</RadioButton>, 
                                <RadioButton value='1' checked={stateType === '1'}>Both training and inference and deploy only in cloud</RadioButton>,                
                                <RadioButton value='2' checked={stateType === '2'}>Only inference and deploy in both cloud and edge</RadioButton>,                
                                <RadioButton value='3' checked={stateType === '3'}>Only inference and deploy only in cloud</RadioButton>                
                            ]}
                        />
                </FormField>
                </Stack>
        },
        {
            title: 'Model',
            content: 
                <Stack>
                    <ModelForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Endpoint',
            content: 
                <Stack>
                    <EndpointForm wizard={true}/>
                </Stack>
        },
        {
            title: 'Rest API',
            content: 
                <Stack>
                    <RestApiForm wizard={true}/>
                </Stack>
        }    
    ]

    if(stateType === '0') {
        return (
            <BrowserRouter>
                <Container>
                    <Wizard steps={steps} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else if(stateType === '1') {
        return (
            <BrowserRouter>
                <Container>
                    <Wizard steps={steps1} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else if(stateType === '2') {
        return (
            <BrowserRouter>
                <Container>
                    <Wizard steps={steps2} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else{
        return (
            <BrowserRouter>
                <Container>
                    <Wizard steps={steps3} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
}

export default PipelineForm;