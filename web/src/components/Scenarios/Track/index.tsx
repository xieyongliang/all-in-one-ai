import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import cognitoUtils from '../../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import { useTranslation } from "react-i18next";

interface IProps {
    isLogin: boolean;
    env: Object;
}

const Track: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    const { t } = useTranslation();

    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Stack>
                <Container title={t('scenarios.about')}>
                    <Text> 
                        {t('scenarios.track.about_content')}
                    </Text>
                </Container>
                <Container title={t('scenarios.features')}>
                    <Text> 
                        {t('scenarios.track.features_content')}
                    </Text>
                </Container>
                <Container title = {t('scenarios.architecture')}>
                    <img src='/track.png' width ='1000' alt=''></img>
                </Container>
            </Stack>
        );
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
    isLogin: state.session.isLogin,
    env: state.general.env
});

export default connect(
    mapStateToProps
)(Track);