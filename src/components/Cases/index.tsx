import { FunctionComponent } from 'react';
import Tabs from 'aws-northstar/components/Tabs';
import Text from 'aws-northstar/components/Text';
import DemoForm from '../Utils/Forms/Demo';
import {useParams} from "react-router-dom";

interface PathParams {
    name: string;
}

const Case: FunctionComponent = () => {
    let params : PathParams = useParams();
    var name = params.name

    const tabs = [
        {
            label: 'Demo',
            id: 'demo',
            content: <DemoForm name = {name}/>
        },
        {
            label: 'ML pipelines',
            id: 'pipeline',
            content: <Text>ML pipelines</Text>
        },
        {
            label: 'Training jobs',
            id: 'training',
            content: <Text>Training jobs</Text>
        },
        {
            label: 'Models',
            id: 'model',
            content: <Text>Model</Text>
        },
        {
            label: 'Endpoints',
            id: 'endpoint',
            content: <Text>Endpoints</Text>
        },
        {
            label: 'Rest apis',
            id: 'restapis',
            content: <Text>Rest apis</Text>
        },
        {
            label: 'Greengrass components',
            id: 'components',
            content: <Text>Greengrass components</Text>
        },
        {
            label: 'Greengrass deployments',
            id: 'deployments',
            content: <Text>Greengrass deployments</Text>
        }
    ];
    return (
        <Tabs tabs={tabs} variant="container" />
    )
}
export default Case;