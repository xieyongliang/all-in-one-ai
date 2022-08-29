import { Container, FormField, RadioButton, RadioGroup, Stack, Toggle } from 'aws-northstar';
import { FunctionComponent } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import SampleTextForm from '../../SampleText'
import LocalTextOutputJsonForm from '../../LocalText/json';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const CPTDemoForm: FunctionComponent<IProps> = (
    {
        advancedMode,
        onAdvancedModeChange
    }) => {    
    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var hash = localtion.hash.substring(1);

    var demoOption = hash === 'sample' || hash === 'local' || hash === 'transformjob' ? hash : 'sample'

    const onChangeOptions = (event, value) => {
        history.push(`/imodels/${params.id}?tab=demo#${value}`);
    }

    const renderDemoOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='sample' checked={demoOption === 'sample'} >Realtime inference with sample data</RadioButton>,
                    <RadioButton value='local' checked={demoOption === 'local'} >Realtime inference with local data</RadioButton>,
                ]}
            />
        )
    }

    return (
        <Stack>
            <Container title = 'Demo options'>
                <FormField controlId={uuidv4()}>            
                    {renderDemoOptions()}
                </FormField>
                <FormField controlId={uuidv4()}>
                    <Toggle label='Advanced mode' checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>
            </Container>
            {demoOption === 'sample' && <SampleTextForm input_format='text' output_format='json' header='Named entity recognition' train_framework='pytorch' deploy_framework='pytorch'/>}
            {demoOption === 'local' && <LocalTextOutputJsonForm header='Named entity recognition' train_framework='pytorch' deploy_framework='pytorch'/>}
        </Stack>
    )
}

export default CPTDemoForm;