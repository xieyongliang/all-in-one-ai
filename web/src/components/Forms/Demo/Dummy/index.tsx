import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Container, Toggle, Link, Inline, Button, FormField } from 'aws-northstar';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import { ALGORITHMS } from '../../../Data/data';
import { PathParams } from '../../../Interfaces/PathParams';
import { AppState } from '../../../../store';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import Iframe from 'react-iframe'

import '../index.scss'
import { useTranslation } from "react-i18next";

interface IProps {
    industrialModels: IIndustrialModel[];
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any; 
}

const DummyForm: FunctionComponent<IProps> = (props) => {
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)

    const { t } = useTranslation();

    const history = useHistory();
    
    var params : PathParams = useParams();

    const[ width, setWidth ] = useState(0);

    const ref = useRef(null);

    const onLoad = () => {
        var offsetWidth = ref.current.parentElement.offsetWidth;
        console.log(offsetWidth - 30)
        setWidth(offsetWidth - 30);
    }

    var industrialModel = props.industrialModels.find((item) => item.id === params.id);
    var algorithm = industrialModel.algorithm;
    var extra = industrialModel.extra
    var href = JSON.parse(extra).href
    var trainable = ALGORITHMS.find((item) => item.value === algorithm).trainable;
    var inferable = ALGORITHMS.find((item) => item.value === algorithm).inferable;

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_invoke_endpoint?action=code'), axios.get('/function/all_in_one_ai_invoke_endpoint?action=console')];
        axios.all(requests)
        .then(axios.spread(function(response0, response1) {
            getSourceCode(response0.data).then((data) => {
                if(cancel) return;
                var zip = new JSZip();
                zip.loadAsync(data).then(async function(zipped) {
                    zipped.file('lambda_function.py').async('string').then(function(data) {
                        if(cancel) return;
                        setSampleCode(data)
                    })
                })
            });
            setSampleConsole(response1.data)           
        }));
        return () => { 
            cancel = true;
        }
    }, []);

    const onStartTrain = () => {
        history.push(`/imodels/${params.id}?tab=train#create`)
    }

    const onStartDeploy = () => {
        history.push(`/imodels/${params.id}?tab=deploy#create`)
    }

    const renderQuickStart = () => {
        return (
            <Container headingVariant='h4' title = {t('industrial_models.demo.quick_start')}>
                <Inline>
                    <div className='quickstartaction'>
                        <Button onClick={onStartTrain} disabled={!trainable}>{t('industrial_models.demo.train')}</Button>
                    </div>
                    <div className='quickstartaction'>
                        <Button onClick={onStartDeploy} disabled={!inferable}>{t('industrial_models.demo.deploy')}</Button>
                    </div>
                </Inline>
            </Container>
        )
    }    
    const renderSampleCode = () => {
        return (
            <Container title = {t('industrial_models.demo.sample_code')}>
                <Toggle label={visibleSampleCode ? t('industrial_models.demo.show_sample_code') : t('industrial_models.demo.hide_sample_code')} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <Link href={sampleConsole}>{t('industrial_models.demo.open_function_in_aws_console')}</Link>
                {
                    visibleSampleCode && <SyntaxHighlighter language='python' style={github} showLineNumbers={true}>
                        {sampleCode}
                    </SyntaxHighlighter>
                }
            </Container>
        )
    }

    console.log(width)

    const renderDemoOptions = () => {
        return (
            <Container title = {t('industrial_models.demo.demo_options')}>
                <FormField controlId={uuidv4()}>
                    <Toggle label = {t('industrial_models.demo.advanced_mode')} checked={props.advancedMode} onChange={props.onAdvancedModeChange}/>
                    {
                        href !== undefined &&
                        <Iframe url={href}
                            width={width.toString()}
                            height="400"
                            id=""
                            className=""
                            display="block"
                            position="relative"
                            frameBorder={1}
                        />
                    }
                </FormField>
            </Container>
        )
    }

    return (
        <div ref={ref} onLoad={onLoad}>
            { renderDemoOptions() }
            { renderQuickStart() }
            { renderSampleCode() }
        </div>
    )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(DummyForm);