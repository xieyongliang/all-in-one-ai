import { FunctionComponent } from 'react';
import Tabs from 'aws-northstar/components/Tabs';
import {useHistory, useParams} from "react-router-dom";
import DemoForm from '../Forms/Demo';
import TrainingJobList from '../Lists/TrainingJob';
import ModelList from '../Lists/Model';
import EndpointList from '../Lists/Endpoint';
import RestApiList from '../Lists/RestApi';
import GreengrassComponentList from '../Lists/GreengrassComponent';
import GreengrassDeploymentList from '../Lists/GreengrassDeployment';
import PipelineList from '../Lists/Pipeline';

interface PathParams {
    name: string;
}

interface CaseProps {
    activeId: string;
}

const Case: FunctionComponent<CaseProps> = (props) => {
    var params : PathParams = useParams();
    var name = params.name

    const history = useHistory();

    const onChange = (activeTabId: string) => {
        history.push('/case/'+name + '/' + activeTabId)
    }

    const tabs = [
        {
            label: 'Demo',
            id: 'demo',
            content: <DemoForm name = {name}/>
        },
        {
            label: 'ML pipelines',
            id: 'pipeline',
            content: <PipelineList name = {name} />
        },
        {
            label: 'Training jobs',
            id: 'trainingjob',
            content: <TrainingJobList name = {name} />
        },
        {
            label: 'Models',
            id: 'model',
            content: <ModelList name = {name}/>
        },
        {
            label: 'Endpoints',
            id: 'endpoint',
            content: <EndpointList name = {name}/>
        },
        {
            label: 'Rest apis',
            id: 'restapi',
            content: <RestApiList name = {name}/>
        },
        {
            label: 'Greengrass components',
            id: 'component',
            content: <GreengrassComponentList name = {name}/>
        },
        {
            label: 'Greengrass deployments',
            id: 'deployment',
            content: <GreengrassDeploymentList name = {name}/>
        }
    ];
    return (
        <Tabs tabs={tabs} variant="container" activeId={props.activeId} onChange={onChange}/>
    )
}
export default Case;