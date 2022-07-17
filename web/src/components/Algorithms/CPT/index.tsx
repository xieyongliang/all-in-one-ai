import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import { store } from '../../..';

const CPT: FunctionComponent = () => {
    if(store.getState().session.isLogin)
        return (
            <Stack>
                <Container title='About CPT'>
                    <Stack>
                    <Text> 
                        CPT - A pre-trained unbalanced transformer for both Chinese language understanding and generation
                    </Text>
                    <Text> 
                        CPT features:
                    </Text>
                    <ol dir="auto">             
                        <li>Chinese BART-base: 6 layers Encoder, 6 layers Decoder, 12 Heads and 768 Model dim.</li>
                        <li>Chinese BART-large: 12 layers Encoder, 12 layers Decoder, 16 Heads and 1024 Model dim.</li>
                        <li>CPT-base: 10 layers S-Enc, 2 layers U-Dec/G-Dec, 12 Heads and 768 Model dim.</li>
                        <li>CPT-large: 20 layers S-Enc, 4 layers U-Dec/G-Dec, 16 Heads and 1024 Model dim.</li>
                    </ol>                
                    <img src='/cpt.png' width='50%' alt=''></img>
                    </Stack>
                </Container>
                <Container title = 'CPT project'>
                    <Text>
                        Check out <Link href='https://github.com/fastnlp/CPT'> CPT </Link> for source code and full documentation on training, testing and deployment.
                    </Text>
                </Container>
            </Stack>
        );
    else
        return (
            <div />
        )
}

export default CPT;