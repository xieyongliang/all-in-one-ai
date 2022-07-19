import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import cognitoUtils from '../../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../../store';

interface IProps {
    isLogin: boolean;
    env: Object;
}

const MDeBERTa: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Stack>
                <Container title='About mDeBERTa'>
                    <Stack>
                    <Text> 
                        DeBERTa (Decoding-enhanced BERT with disentangled attention) improves the BERT and RoBERTa models using two novel techniques. 
                    </Text>
                    <ol dir="auto">    
                        <li>The first is the disentangled attention mechanism, where each word is represented using two vectors that encode its content and position, respectively, and the attention weights among words are computed using disentangled matrices on their contents and relative positions. </li>
                        <li>Second, an enhanced mask decoder is used to replace the output softmax layer to predict the masked tokens for model pretraining. We show that these two techniques significantly improve the efficiency of model pre-training and performance of downstream tasks.</li>
                    </ol>
                    <Text> 
                        This multilingual model can perform natural language inference (NLI) on 100 languages and is therefore also suitable for multilingual zero-shot classification. The underlying model was pre-trained by Microsoft on the CC100 multilingual dataset. It was then fine-tuned on the XNLI dataset, which contains hypothesis-premise pairs from 15 languages, as well as the English MNLI dataset. As of December 2021, mDeBERTa-base is the best performing multilingual base-sized transformer model
                    </Text>
                    </Stack>
                </Container>
                <Container title = 'mDeBERTa project'>
                    <Text>
                        Check out <Link href='https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-mnli-xnli'> mDeBERTa </Link> for source code and full documentation on training, testing and deployment.
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
)(MDeBERTa);