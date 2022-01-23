import { FunctionComponent } from 'react';
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';
import Container from 'aws-northstar/layouts/Container';

const DemoForm: FunctionComponent = () => {
    return (
        <Container headingVariant='h4' title='Radio group'>
            <RadioGroup
                items={[
                    <RadioButton value="one">one</RadioButton>, 
                    <RadioButton value="two">two</RadioButton>,
                    <RadioButton value="three">three</RadioButton>,
                    <RadioButton value="disabled" disabled>disabled</RadioButton>,
                    <RadioButton value="with description" description="Here is a description">with description</RadioButton>,
                ]}
            />
        </Container>
    );
}

export default DemoForm;