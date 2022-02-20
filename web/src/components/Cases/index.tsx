import { FunctionComponent } from 'react';
import Tabs from 'aws-northstar/components/Tabs';
import { useHistory, useLocation, useParams } from "react-router-dom";
import { PathParams } from '../Interfaces/PathParams';
import DemoForm from '../Forms/Demo';
import TrainingJobList from '../Lists/TrainingJob';
import ModelList from '../Lists/Model';
import EndpointList from '../Lists/Endpoint';
import RestApiList from '../Lists/RestApi';
import GreengrassComponentList from '../Lists/GreengrassComponent';
import GreengrassDeploymentList from '../Lists/GreengrassDeployment';
import PipelineList from '../Lists/Pipeline';
import TrainingJobForm from '../Forms/TrainingJob';
import PipelineForm from '../Forms/Pipeline';
import ModelForm from '../Forms/Model';
import EndpointForm from '../Forms/Endpoint';
import RestApiForm from '../Forms/RestApi';
import GreengrassComponentForm from '../Forms/GreengrassComponent';
import GreengrassDeploymentForm from '../Forms/GreengrassDeployment';
import TransformJobForm from '../Forms/TransformJob';
import TransformJobProp from '../Props/TransformJob';
import TrainingJobProp from '../Props/TrainingJob';

const Case: FunctionComponent = () => {
    var params : PathParams = useParams();

    var localtion = useLocation();
    const search = new URLSearchParams(localtion.search);
    
    var tab = search.get('tab') !== undefined ? search.get('tab') : 'demo';
    var hash = localtion.hash.substring(1);

    const history = useHistory();

    const onChange = (tab: string) => {
        history.push(`/case/${params.name}?tab=${tab}`);
    }

    if(hash === 'form' || hash === 'review') {
        switch(tab) {
            case 'demo':
                return <TransformJobForm/>;
            case 'pipeline':
                return <PipelineForm/>;
            case 'trainingjob':
                return <TrainingJobForm/>;
            case 'model':
                return <ModelForm/>;
            case 'endpoint':
                return <EndpointForm/>;
            case 'restapi':
                return <RestApiForm/>;
            case 'component':
                return <GreengrassComponentForm/>;
            case 'deployment':
                return <GreengrassDeploymentForm/>;
        }
    }

    if(hash.startsWith('prop')) {
        switch(tab) {
            case 'demo':
                return <TransformJobProp/>;
            case 'trainingjob':
                return <TrainingJobProp/>;
        }
    }

    const tabs = [
        {
            label: 'Demo',
            id: 'demo',
            content: <DemoForm/>
        },
        {
            label: 'ML pipelines',
            id: 'pipeline',
            content: <PipelineList name = {params.name} />
        },
        {
            label: 'Training jobs',
            id: 'trainingjob',
            content: <TrainingJobList name = {params.name} />
        },
        {
            label: 'Models',
            id: 'model',
            content: <ModelList name = {params.name}/>
        },
        {
            label: 'Endpoints',
            id: 'endpoint',
            content: <EndpointList name = {params.name}/>
        },
        {
            label: 'Rest apis',
            id: 'restapi',
            content: <RestApiList name = {params.name}/>
        },
        {
            label: 'Greengrass components',
            id: 'component',
            content: <GreengrassComponentList name = {params.name}/>
        },
        {
            label: 'Greengrass deployments',
            id: 'deployment',
            content: <GreengrassDeploymentList name = {params.name}/>
        }
    ];
    return (
        <Tabs tabs={tabs} variant="container" activeId={tab} onChange={onChange}/>
    )
}
export default Case;