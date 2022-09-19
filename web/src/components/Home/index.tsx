import { FunctionComponent } from 'react';
import { Heading, Paper, Stack, Box, Card, Inline, Link, Text } from 'aws-northstar';
import cognitoUtils from '../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { useTranslation } from "react-i18next";
import { logOutput } from '../Utils/Helper';

interface IProps {
    isLogin: boolean;
    env: Object;
}

const Home: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    const { t } = useTranslation();

    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Paper>
                <Box p={1} width='100%'>
                        <Stack spacing='xs'>
                            <div style={{textAlign: "center"}}>
                                <Heading variant='h1'>{t('home.title')}</Heading>
                            </div>
                            <div style={{textAlign: "center", marginTop: "30px", marginBottom: "10px"}}>
                                <Heading variant='h2'>{t('home.about')}</Heading>
                            </div>
                            <div style={{marginTop: "10px", marginBottom: "10px"}}>
                                <Text> {t('home.about_content')} </Text>
                            </div>
                            <Link href='https://www.amazonaws.cn/en/solutions/horizontal/guidance/all-in-one-ai/'> {t('home.official_website')} </Link>
                            <div style={{textAlign: "center"}}>
                                <Heading variant='h2'>{t('home.advantanges')}</Heading>
                            </div>
                            <Inline>
                                <Card 
                                    title={t('home.advantange_muliple_industrial_models')}
                                    titleTypographyProps={{ variant: 'h3', color: 'secondary'}}
                                >
                                        {t('home.advantange_muliple_industrial_models_content')}
                                </Card>
                                <Card 
                                    title={t('home.advantange_muliple_industrial_algorithms')}
                                    titleTypographyProps={{ variant: 'h3', color: 'secondary'}}
                                >
                                        {t('home.advantange_muliple_industrial_algorithms_content')}
                                </Card>
                                <Card 
                                    title={t('home.fully_machine_learning_process_support')}
                                    titleTypographyProps={{ variant: 'h3', color: 'secondary'}}
                                >
                                        {t('home.fully_machine_learning_process_support_content')}
                                </Card>
                            </Inline>
                            <div style={{textAlign: "center", marginTop: "30px"}}>
                                <Heading variant='h2'>{t('home.architecture')}</Heading>
                            </div>
                            <div style={{textAlign: "center", marginTop: "10px", marginBottom: "10px"}}>
                                <img src='/architecture.png' style={{width: "900px"}} alt={t('home.architecture')}/>
                            </div>
                            <div style={{marginTop: "10px", marginBottom: "10px"}}>
                                <Heading variant='h4'>{t('home.architecture_components')}</Heading>
                            </div>
                            <div style={{marginTop: "10px", marginBottom: "10px"}}>
                                <ul>
                                   <li>{t('home.architecture_component_load_balaner')}</li> 
                                   <li>{t('home.architecture_component_ecs')}</li> 
                                   <li>{t('home.architecture_component_api_gateway')}</li> 
                                   <li>{t('home.architecture_compoent_lambda')}</li> 
                                   <li>{t('home.architecture_component_sagemaker')}</li> 
                                   <li>{t('home.architecture_component_greengrass')}</li> 
                                   <li>{t('home.architecture_component_iam')}</li> 
                                   <li>{t('home.architecture_component_vpc')}</li> 
                                   <li>{t('home.architecture_component_s3')}</li> 
                                   <li>{t('home.architecture_component_efs')}</li> 
                                   <li>{t('home.architecture_component_dynamodb')}</li> 
                                   <li>{t('home.architecture_component_sqs')}</li> 
                                   <li>{t('home.architecture_component_opensearch')}</li> 
                                   <li>{t('home.architecture_component_cloudwatch')}</li> 
                                   <li>{t('home.architecture_component_cloudformation')}</li> 
                                   <li>{t('home.architecture_component_cognito')}</li> 
                                </ul>
                            </div>
                        </Stack>
                    </Box>
                </Paper>
            )
    else {
        if(env['cognitoRegion'] !== undefined )
            cognitoUtils.getCognitoSignInUri().then(data => {
                window.location.href = data
            }).catch((error) => {
                logOutput('error', error.response.data, undefined, error);
            });
        return (<div></div>)
    } 
}

const mapStateToProps = (state: AppState) => ({
    isLogin: state.session.isLogin,
    env: state.general.env
});

export default connect(
    mapStateToProps
)(Home);