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
                <ol dir="auto">
                    <li>Training scripts that reproduce SOTA results reported in latest papers </li>
                    <li>Supports both PyTorch and MXNet</li>
                    <li>A large set of pre-trained models</li>
                    <li>Carefully designed APIs and easy to understand implementations</li>
                    <li>Community support</li>
                </ol>                
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