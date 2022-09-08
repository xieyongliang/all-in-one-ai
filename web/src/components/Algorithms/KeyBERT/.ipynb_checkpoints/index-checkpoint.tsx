import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import cognitoUtils from '../../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../../store';

interface IProps {
    isLogin: boolean;
    env: Object;
}

const KeyBERT: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Stack>
                <Container title='About KeyBERT'>
                    <Stack>
                    <Text> 
                    KeyBERT is a minimal and easy-to-use keyword extraction technique that leverages BERT embeddings to create keywords and keyphrases that are most similar to a document.
                    </Text>
                    <Text> 
                        Although there are already many methods available for keyword generation (e.g., Rake, YAKE!, TF-IDF, etc.) I wanted to create a very basic, but powerful method for extracting keywords and keyphrases. This is where KeyBERT comes in! Which uses BERT-embeddings and simple cosine similarity to find the sub-phrases in a document that are the most similar to the document itself.

First, document embeddings are extracted with BERT to get a document-level representation. Then, word embeddings are extracted for N-gram words/phrases. Finally, we use cosine similarity to find the words/phrases that are the most similar to the document. The most similar words could then be identified as the words that best describe the entire document.

KeyBERT is by no means unique and is created as a quick and easy method for creating keywords and keyphrases. Although there are many great papers and solutions out there that use BERT-embeddings (e.g., 1, 2, 3, ), I could not find a BERT-based solution that did not have to be trained from scratch and could be used for beginners (correct me if I'm wrong!). Thus, the goal was a pip install keybert and at most 3 lines of code in usage.
                    </Text>
                    </Stack>
                </Container>
                <Container title = 'KeyBERT project'>
                    <Text>
                        Check out <Link href='https://github.com/MaartenGr/KeyBERT'> KeyBERT </Link> for source code and full documentation on training, testing and deployment.
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
)(KeyBERT);