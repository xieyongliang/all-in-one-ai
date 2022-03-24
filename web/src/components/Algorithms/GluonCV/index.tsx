import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';

const GluonCV: FunctionComponent = () => {
    return (
        <Stack>
            <Container title='About GluonCV'>
                <Stack>
                <Text> 
                    GluonCV provides implementations of state-of-the-art (SOTA) deep learning algorithms in computer vision. It aims to help engineers, researchers, and students quickly prototype products, validate new ideas and learn computer vision.
                </Text>
                <Text> 
                    GluonCV features:
                </Text>
                <Text>
                    <ul> 1. training scripts that reproduce SOTA results reported in latest papers </ul>
                    <ul> 2. a large set of pre-trained models </ul>
                    <ul> 3. carefully designed APIs and easy to understand implementations </ul>
                    <ul> 4. community support </ul>
                </Text>
                <img src='/gluoncv.gif' alt=''></img>
                </Stack>
            </Container>
            <Container title = 'GluonCV project'>
                <Text>
                    Check out <Link href='https://cv.gluon.ai/contents.html'> GluonCV </Link> for source code and full documentation on training, testing and deployment.
                </Text>
            </Container>
        </Stack>
    );
}

export default GluonCV;