import Wizard from 'aws-northstar/components/Wizard';
import { BrowserRouter, useHistory, useParams } from 'react-router-dom';
import FormField from 'aws-northstar/components/FormField'
import Input from 'aws-northstar/components/Input';
import Container from 'aws-northstar/layouts/Container';
import { FunctionComponent, useState } from 'react';
import { Stack } from 'aws-northstar';
import TrainingJobForm from '../TrainingJob';
import ModelForm from '../Model';
import EndpointForm from '../Endpoint';
import RestApiForm from '../RestApi';
import GreengrassComponentForm from '../GreengrassComponent';
import GreengrassDeploymentForm from '../GreengrassDeployment';
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';
interface PathParams {
    name: string;
}

interface PipelineFormProps {
    wizard?: boolean;
}

const PipelineForm: FunctionComponent<PipelineFormProps> = (props) => {
    const [pipelineType, setPipelineType] = useState('0')

    const onChangeOptions = (event, value) => {
        setPipelineType(value)
    }
    
    const history = useHistory();

    var params : PathParams = useParams();

    const onSubmit = () => {
        history.push('/case/' + params.name + '?tab=pipeline')
    }

    const onCancel = () => {
        history.push('/case/' + params.name + '?tab=pipeline')
    }

    const renderPipelineOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value="0" checked={pipelineType==='0'}>Both training and inference and deploy in both cloud and edge</RadioButton>, 
                    <RadioButton value="1" checked={pipelineType==='1'}>Both training and inference and deploy only in cloud</RadioButton>,
                    <RadioButton value="2" checked={pipelineType==='2'}>Only inference and deploy in both cloud and edge</RadioButton>,
                    <RadioButton value="3" checked={pipelineType==='3'}>Only inference and deploy only in cloud</RadioButton>
                ]}
            />
        )
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
                        {renderPipelineOptions()}
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
                        {renderPipelineOptions()}
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
                        {renderPipelineOptions()}
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
                        {renderPipelineOptions()}
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
                        {renderPipelineOptions()}
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

    if(pipelineType === '0') {
        return (
            <BrowserRouter>
                <Container>
                    <Wizard steps={steps} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else if(pipelineType === '1') {
        return (
            <BrowserRouter>
                <Container>
                    <Wizard steps={steps1} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else if(pipelineType === '2') {
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