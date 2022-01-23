import { FunctionComponent } from 'react';
import Tabs from 'aws-northstar/components/Tabs';
import Text from 'aws-northstar/components/Text';
import DemoPage from '../../Utils/Forms/Demo';

interface CaseProps {
    name: string;
}

const CasePage: FunctionComponent<CaseProps> = (props) => {
    const tabs = [
        {
            label: 'First tab label',
            id: 'first',
            content: <DemoPage name = {props.name}/>
        },
        {
            label: 'Second tab label',
            id: 'second',
            content: <Text>Second tab content area</Text>
        }
    ];
    return (
        <Tabs tabs={tabs} variant="container" />
    )
}
export default CasePage;