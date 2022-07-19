import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import cognitoUtils from '../../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../../store';

interface IProps {
    isLogin: boolean;
    env: Object;
}

const PaddleOCR: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Stack>
                <Container title='About PaddleOCR'>
                    <Stack>
                    <Text> 
                    PaddleOCR aims to create multilingual, awesome, leading, and practical OCR tools that help users train better models and apply them into practice.
                    </Text>
                    <Text> 
                        PaddleOCR features:
                    </Text>
                    <ul dir="auto">
                        <li>PP-OCR - A series of high-quality pre-trained models, comparable to commercial products
                        <ul dir="auto">
                            <li>Ultra lightweight PP-OCRv2 series models: detection (3.1M) + direction classifier (1.4M) + recognition 8.5M) = 13.0M</li>
                            <li>Ultra lightweight PP-OCR mobile series models: detection (3.0M) + direction classifier (1.4M) + recognition (5.0M) = 9.4M</li>
                            <li>General PP-OCR server series models: detection (47.1M) + direction classifier (1.4M) + recognition (94.9M) = 143.4M</li>
                            <li>Support Chinese, English, and digit recognition, vertical text recognition, and long text recognition</li>
                            <li>Support multi-lingual recognition: about 80 languages like Korean, Japanese, German, French, etc</li>
                        </ul>
                        </li>
                        <li>PP-Structure: a document structurize system
                        <ul dir="auto">
                            <li>Support layout analysis and table recognition (support export to Excel)</li>
                            <li>Support key information extraction</li>
                            <li>Support DocVQA</li>
                        </ul>
                        </li>
                        <li>Rich OCR toolkit
                        <ul dir="auto">
                            <li>Semi-automatic data annotation tool, i.e., PPOCRLabel: support fast and efficient data annotation</li>
                            <li>Data synthesis tool, i.e., Style-Text: easy to synthesize a large number of images which are similar to the target scene image</li>
                        </ul>
                        </li>
                        <li>Support user-defined training, provides rich predictive inference deployment solutions</li>
                        <li>Support PIP installation, easy to use</li>
                        <li>Support Linux, Windows, MacOS and other systems</li>
                    </ul>
                    <img src='/paddle.png' width='50%' alt=''></img>
                    </Stack>
                </Container>
                <Container title = 'PaddleOCR project'>
                    <Text>
                        Check out <Link href='https://github.com/PaddlePaddle/PaddleOCR'> PaddleOCR </Link> for source code and full documentation on training, testing and deployment.
                    </Text>
                </Container>
            </Stack>
        );
    else {
        if(env['cognitoRegion'] !== undefined )
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
)(PaddleOCR);
