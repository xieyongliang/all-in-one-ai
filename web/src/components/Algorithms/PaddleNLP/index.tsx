import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import cognitoUtils from '../../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../../store';

interface IProps {
    isLogin: boolean;
    env: Object;
}

const PaddleNLP: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Stack>
                <Container title='About PaddleNLP'>
                    <Stack>
                    <Text> 
                    PaddleNLP is an easy-to-use and powerful NLP library with Awesome pre-trained model zoo, supporting wide-range of NLP tasks from research to industrial applications.
                    </Text>
                    <Text> 
                        PaddleNLP features:
                    </Text>
                    <ul dir="auto">
                        <li>Out-Of-Box NLP Toolset
                        <ul dir="auto">
                            <li>Taskflow aims to provide off-the-shelf NLP pre-built task covering NLU and NLG technique, in the meanwhile with extreamly fast infernece satisfying industrial scenario.</li>
                        </ul>
                        </li>
                        <li>Awesome Chinese Model Zoo
                            <ul dir="auto">
                                <li>Comprehensive Chinese Transformer Models</li>
                                <ul dir="auto">
                                    <li>We provide 45+ network architectures and over 500+ pretrained models. Not only includes all the SOTA model like ERNIE, PLATO and SKEP released by Baidu, but also integrates most of the high-quality Chinese pretrained model developed by other organizations. Use AutoModel API to ⚡SUPER FAST⚡ download pretrained mdoels of different architecture. We welcome all developers to contribute your Transformer models to PaddleNLP!</li>
                                    <li>Unified API experience for NLP task like semantic representation, text classification, sentence matching, sequence labeling, question answering, etc.</li>
                                </ul>
                                <li>Wide-range NLP Task Support</li>
                                <ul dir="auto">
                                    <li>PaddleNLP provides rich examples covering mainstream NLP task to help developers accelerate problem solving. You can find our powerful transformer Model Zoo, and wide-range NLP application exmaples with detailed instructions.</li>
                                </ul>
                            </ul>
                        </li>
                        <li>Industrial End-to-end System
                        <ul dir="auto">
                            <li>Neural Search System</li>
                            <li>Question Answering System</li>
                            <li>Opinion Extraction and Sentiment Analysis</li>
                            <li>Speech Command Analysis</li>
                        </ul>
                        </li>
                        <li>High Performance Distributed Training and Inference</li>
                    </ul>
                    </Stack>
                </Container>
                <Container title = 'PaddleNLP project'>
                    <Text>
                        Check out <Link href='https://github.com/PaddlePaddle/PaddleNLP'> PaddleNLP </Link> for source code and full documentation on training, testing and deployment.
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
)(PaddleNLP);