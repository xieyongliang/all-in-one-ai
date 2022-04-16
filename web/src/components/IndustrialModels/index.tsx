import { FunctionComponent, useState } from 'react';
import Tabs from 'aws-northstar/components/Tabs';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { PathParams } from '../Interfaces/PathParams';
import Yolov5DemoForm from '../Forms/Demo/Single/yolov5';
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
import ModelProp from '../Props/Model';
import EndpointProp from '../Props/Endpoint';
import RestApiProp from '../Props/RestApi'
import GreengrassComponentProp from '../Props/GreengrassComponent';
import GreengrassDeploymentProp from '../Props/GreengrassDeployment';
import PipelineProp from '../Props/Pipeline';
import { AppState } from '../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../store/industrialmodels/reducer';
import LiteModelForm from '../Forms/Model/lite'
import GluonCVDemoForm from '../Forms/Demo/Single/gluoncv'
import { LoadingIndicator } from 'aws-northstar';
import PaddleOCRDemoForm from '../Forms/Demo/Single/paddleocr';
import Yolov5PaddleOCRDemoForm from '../Forms/Demo/Mixed/yolov5&paddleocr';

interface IProps {
    industrialModels : IIndustrialModel[];
}

const IndustrialModels: FunctionComponent<IProps> = (
    {
        industrialModels
    }) => {
    const [ cookies, setCookie ] = useCookies();
    const [ advancedMode, setAdvancedMode ] = useState(cookies.advancedMode !== undefined? (cookies.advancedMode === 'true') : false)
    
    var params : PathParams = useParams();

    const history = useHistory();

    var localtion = useLocation();

    const search = new URLSearchParams(localtion.search);
    
    var tab = search.get('tab') !== undefined ? search.get('tab') : 'demo';

    var hash = localtion.hash.substring(1);

    const onChange = (tab: string) => {
        history.push(`/imodels/${params.id}?tab=${tab}`);
    }

    var index = industrialModels.findIndex((item) => item.id === params.id)

    if(index === -1)
        return (
            <LoadingIndicator label='Loading...'/>
        )

    const onAdvancedModeChange = (checked) => {
        setAdvancedMode(checked)
        setCookie('advancedMode', checked, { path: '/' });
    }
        
    var algorithm = industrialModels[index].algorithm;

    var tabs;

    if(algorithm === 'yolov5') {
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
                case 'greengrasscomponentversion':
                    return <GreengrassComponentForm/>;
                case 'greengrassdeployment':
                    return <GreengrassDeploymentForm/>;
            }
        }

        if(hash.startsWith('prop')) {
            switch(tab) {
                case 'demo':
                    return <TransformJobProp />;
                case 'trainingjob':
                    return <TrainingJobProp />;
                case 'model':
                    return <ModelProp />;
                case 'endpoint':
                    return <EndpointProp />;
                case 'restapi':
                    return <RestApiProp />;
                case 'greengrasscomponentversion':
                    return <GreengrassComponentProp/>;
                case 'greengrassdeployment':
                    return <GreengrassDeploymentProp/>;
                case 'pipeline':
                    return <PipelineProp/>;
            }
        }

        if(advancedMode)
            tabs = [
                {
                    label: 'Demo',
                    id: 'demo',
                    content: <Yolov5DemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
                },
                {
                    label: 'ML pipelines',
                    id: 'pipeline',
                    content: <PipelineList />
                },
                {
                    label: 'Training jobs',
                    id: 'trainingjob',
                    content: <TrainingJobList />
                },
                {
                    label: 'Models',
                    id: 'model',
                    content: <ModelList/>
                },
                {
                    label: 'Endpoints',
                    id: 'endpoint',
                    content: <EndpointList/>
                },
                {
                    label: 'Rest apis',
                    id: 'restapi',
                    content: <RestApiList/>
                },
                {
                    label: 'Greengrass components',
                    id: 'greengrasscomponentversion',
                    content: <GreengrassComponentList/>
                },
                {
                    label: 'Greengrass deployments',
                    id: 'greengrassdeployment',
                    content: <GreengrassDeploymentList/>
                }
            ]; 
        else
            tabs = [
                {
                    label: 'Demo',
                    id: 'demo',
                    content: <Yolov5DemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange} />
                }
            ]   
        return (
            <Tabs tabs={tabs} variant='container' activeId={tab} onChange={onChange}/>
        )
    } 
    else if(algorithm === 'paddleocr') {
        if(hash === 'form' || hash === 'review') {
            switch(tab) {
                case 'model':
                    return <LiteModelForm/>;
                case 'endpoint':
                    return <EndpointForm/>;
            }
        }

        if(hash.startsWith('prop')) {
            switch(tab) {
                case 'model':
                    return <ModelProp />;
                case 'endpoint':
                    return <EndpointProp />;
            }
        }

        if(advancedMode)
            tabs = [
                {
                    label: 'Demo',
                    id: 'demo',
                    content: <PaddleOCRDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
                },
                {
                    label: 'Models',
                    id: 'model',
                    content: <ModelList/>
                },
                {
                    label: 'Endpoints',
                    id: 'endpoint',
                    content: <EndpointList/>
                }
            ];
        else
            tabs = [
                {
                    label: 'Demo',
                    id: 'demo',
                    content: <PaddleOCRDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
                }
            ]
        return (
            <Tabs tabs={tabs} variant='container' activeId={tab} onChange={onChange}/>
        )
    }
    else if(algorithm === 'gluoncv'){
        if(hash === 'form') {
            switch(tab) {
                case 'demo':
                    return <GluonCVDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>;
                case 'model':
                    return <LiteModelForm/>;
                case 'endpoint':
                    return <EndpointForm/>;
            }
        }

        if(hash.startsWith('prop')) {
            switch(tab) {
                case 'model':
                    return <ModelProp />;
                case 'endpoint':
                    return <EndpointProp />;
            }
        }

        if(advancedMode)
            tabs = [
                {
                    label: 'Demo',
                    id: 'demo',
                    content: <GluonCVDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
                },
                {
                    label: 'Models',
                    id: 'model',
                    content: <ModelList/>
                },
                {
                    label: 'Endpoints',
                    id: 'endpoint',
                    content: <EndpointList/>
                }
            ];
        else
            tabs = [
                {
                    label: 'Demo',
                    id: 'demo',
                    content: <GluonCVDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
                }
            ]
        return (
            <Tabs tabs={tabs} variant='container' activeId={tab} onChange={onChange}/>
        )
    }
    else {
        const tabs = [
            {
                label: 'Demo',
                id: 'demo',
                content: <Yolov5PaddleOCRDemoForm/>
            }
        ];
        return (
            <Tabs tabs={tabs} variant='container' activeId={tab} onChange={onChange}/>
        )
    }
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(IndustrialModels);