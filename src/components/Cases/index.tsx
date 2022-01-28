import { FunctionComponent } from 'react';
import Tabs from 'aws-northstar/components/Tabs';
import {useHistory, useParams} from "react-router-dom";
import DemoForm from '../Utils/Forms/Demo';
import TrainingJobList from '../Utils/Lists/TrainingJob';
import ModelList from '../Utils/Lists/Model';
import EndpointList from '../Utils/Lists/Endpoint';
import RestapiList from '../Utils/Lists/Restapi';
import ComponentList from '../Utils/Lists/Component';
import DeploymentList from '../Utils/Lists/Deployment';
import PipelineList from '../Utils/Lists/Pipeline';

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
            content: <RestapiList name = {name}/>
        },
        {
            label: 'Greengrass components',
            id: 'component',
            content: <ComponentList name = {name}/>
        },
        {
            label: 'Greengrass deployments',
            id: 'deployment',
            content: <DeploymentList name = {name}/>
        }
    ];
    return (
        <Tabs tabs={tabs} variant="container" activeId={props.activeId} onChange={onChange}/>
    )
}
export default Case;