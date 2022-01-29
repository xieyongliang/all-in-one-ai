import Wizard from 'aws-northstar/components/Wizard';
import { BrowserRouter } from 'react-router-dom';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField'
import Input from 'aws-northstar/components/Input';
import Textarea from 'aws-northstar/components/Textarea';
import Select from 'aws-northstar/components/Select';
import Toggle from 'aws-northstar/components/Toggle';
import Container from 'aws-northstar/layouts/Container';
import { ChangeEvent, FunctionComponent, useState } from 'react';
import { RadioButton, RadioGroup, Stack } from 'aws-northstar';
import TrainingJobForm from '../TrainingJob';

const PipelineForm: FunctionComponent = () => {
    const [stateType, setStateType] = useState('0')

    const onChange = (event?: ChangeEvent<HTMLInputElement>, value?: string)=>{
        var option : string = value || ''
        setStateType(option)
    }
    
    const steps = [
        {
            title: 'Pipeline',
            description:
                ' Each instance type includes one or more instance sizes, allowing you to scale your resources to the requirements of your target workload.',
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
            title: 'Configure security group',
            content: <FormSection header="Form section">
                <FormField label="Example select" controlId="formFieldId6">
                    <Select
                            placeholder="Choose an option"
                            controlId="formFieldId7"
                            options={[
                                { label: 'Option 1', value: '1' },
                                { label: 'Option 2', value: '2' },
                                { label: 'Option 3', value: '3' }
                            ]}
                        />
                </FormField>
                <Toggle label="Check me out" />
            </FormSection>,
            isOptional: true
        },
    ];
    
    return (
        <BrowserRouter>
            <Container>
                <Wizard steps={steps} />
            </Container>
        </BrowserRouter>
    )
}

export default PipelineForm;