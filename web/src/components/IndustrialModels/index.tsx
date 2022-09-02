import { FunctionComponent, useState } from 'react';
import Tabs from 'aws-northstar/components/Tabs';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { PathParams } from '../Interfaces/PathParams';
import Yolov5DemoForm from '../Forms/Demo/Single/yolov5';
import TrainingJobList from '../Lists/TrainingJob';
import ModelList from '../Lists/Model';
import EndpointList from '../Lists/Endpoint';
import TransformJobList from '../Lists/TransformJob'
import RestApiList from '../Lists/RestApi';
import GreengrassComponentList from '../Lists/GreengrassComponent';
import GreengrassDeploymentList from '../Lists/GreengrassDeployment';
import PipelineList from '../Lists/Pipeline';
import TrainingJobForm from '../Forms/TrainingJob';
import DeployForm from '../Forms/Deploy';
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
import GluonCVDemoForm from '../Forms/Demo/Single/gluoncv'
import { LoadingIndicator } from 'aws-northstar';
import PaddleOCRDemoForm from '../Forms/Demo/Single/paddleocr';
import Yolov5PaddleOCRDemoForm from '../Forms/Demo/Mixed/yolov5&paddleocr';
import CPTDemoForm from '../Forms/Demo/Single/cpt';
import GABSADemoFrom from '../Forms/Demo/Single/gabsa';
import PaddleNLPDemoForm from '../Forms/Demo/Single/paddlenlp'
import DeBERTaDemoForm from '../Forms/Demo/Single/mdeberta'
import cognitoUtils from '../../lib/cognitoUtils';
import { useTranslation } from "react-i18next";

interface IProps {
    industrialModels : IIndustrialModel[];
    isLogin: boolean;
    env: Object;
}

const IndustrialModels: FunctionComponent<IProps> = (
    {
        industrialModels,
        isLogin,
        env
    }) => {
    const [ cookies, setCookie ] = useCookies();
    const [ advancedMode, setAdvancedMode ] = useState(cookies.advancedMode !== undefined? (cookies.advancedMode === 'true') : false)

    const { t } = useTranslation();

    var params : PathParams = useParams();

    const history = useHistory();

    var localtion = useLocation();

    var hash = localtion.hash.substring(1);

    const search = new URLSearchParams(localtion.search);
    
    var tab = search.get('tab') !== undefined ? search.get('tab') : 'demo';

    const onChange = (tab: string) => {
        history.push(`/imodels/${params.id}?tab=${tab}`);
    }

    var index = industrialModels.findIndex((item) => item.id === params.id)

    if(index === -1)
        return (
            <LoadingIndicator label={t('industrial_models.demo.loading')}/>
        )

    const onAdvancedModeChange = (checked) => {
        setAdvancedMode(checked)
        setCookie('advancedMode', checked, { path: '/' });
    }
        
    var algorithm = industrialModels[index].algorithm;

    var tabs, advancedTabs;

    if(hash === 'create' || hash === 'review') {
        switch(tab) {
            case 'transformjob':
                return <TransformJobForm/>;
            case 'pipeline':
                return <PipelineForm/>;
            case 'trainingjob':
            case 'train':
                return <TrainingJobForm/>;
            case 'model':
                return <ModelForm/>;
            case 'endpoint':
                return <EndpointForm/>;
            case 'deploy':
                return <DeployForm/>;
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
            case 'transformjob':
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

    advancedTabs = [
        {
            label: t('industrial_models.pipelines'),
            id: 'pipeline',
            content: <PipelineList />
        },
        {
            label: t('industrial_models.training_jobs'),
            id: 'trainingjob',
            content: <TrainingJobList />
        },
        {
            label: t('industrial_models.models'),
            id: 'model',
            content: <ModelList/>
        },
        {
            label: t('industrial_models.endpoints'),
            id: 'endpoint',
            content: <EndpointList/>
        },
        {
            label: t('industrial_models.transform_jobs'),
            id: 'transformjob',
            content: <TransformJobList/>
        },
        {
            label: t('industrial_models.rest_apis'),
            id: 'restapi',
            content: <RestApiList/>
        },
        (algorithm === 'yolov5') && {
            label: t('industrial_models.greengrass_components'),
            id: 'greengrasscomponentversion',
            content: <GreengrassComponentList/>
        },
        (algorithm === 'yolov5') && {
            label: t('industrial_models.greengrass_deployments'),
            id: 'greengrassdeployment',
            content: <GreengrassDeploymentList/>
        }
    ]; 


    if(algorithm === 'yolov5') {
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <Yolov5DemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange} />
            }
        ]   
    } 
    else if(algorithm === 'paddleocr') {
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <PaddleOCRDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
            }
        ]
    }
    else if(algorithm === 'gluoncv'){
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <GluonCVDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
            }
        ]
    }
    else if(algorithm === 'cpt'){
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <CPTDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
            }
        ]     
    }
    else if(algorithm === 'gabsa'){
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <GABSADemoFrom advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
            }
        ]     
    }
    else if(algorithm === 'paddlenlp'){
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <PaddleNLPDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
            }
        ]     
    }
    else if(algorithm === 'mdeberta'){
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <DeBERTaDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
            }
        ]     
    }
    else {
        tabs = [
            {
                label: t('industrial_models.demos'),
                id: 'demo',
                content: <Yolov5PaddleOCRDemoForm advancedMode={advancedMode} onAdvancedModeChange={onAdvancedModeChange}/>
            }
        ];
    }

    if(advancedMode)
        tabs = tabs.concat(advancedTabs)

    
    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Tabs tabs={tabs} variant='container' activeId={tab} onChange={onChange}/>
        )
    else {
        if(env['cognitoRegion'] !== undefined)
            cognitoUtils.getCognitoSignInUri().then(data => {
                window.location.href = data
            }).catch((error) => {
                console.log(error)
            });
        return (<div></div>)
    }
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels,
    isLogin: state.session.isLogin,
    env: state.general.env
});

export default connect(
    mapStateToProps
)(IndustrialModels);