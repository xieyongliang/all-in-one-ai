import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';

const GABSA: FunctionComponent = () => {
    return (
        <Stack>
            <Container title='About CPT'>
                <Stack>
                <Text> 
                    Genearative ABSA - Genearative Aspect Based Sentiment Analysis is an novel generative framework transforming
ABSA tasks, which are typically treated as classification problems, into text generation problems.
                </Text>
                <Text> 
                    GABSA tasks:
                </Text>
                <ol dir="auto">             
                    <li>Aspect Opinion Pair Extraction (AOPE) aims to extract aspect terms and their corresponding opinion terms as pairs</li>
                    <li>Unified ABSA (UABSA) is the task of extracting aspect terms and predicting their sentiment polarities at the same time (Li et al., 2019a; Chen and Qian, 2020). We also formulate it as an (aspect, sentiment polarity) pair extraction problem.</li>
                    <li>Aspect Sentiment Triplet Extraction (ASTE) aims to discover more complicated (aspect, opinion, sentiment polarity) triplets.</li>
                    <li>Target Aspect Sentiment Detection (TASD) is the task to detect all (aspect term, aspect category, entiment polarity) triplets for a given sentence (Wan et al., 2020), where the aspect category belongs to a pre-defined category set</li>
                </ol>                
                </Stack>
            </Container>
            <Container title = 'GSABA'>
                <Text>
                    Check out <Link href='https://github.com/IsakZhang/Generative-ABSA'> GABSA </Link> for source code and full documentation on training, testing and deployment.
                </Text>
            </Container>
        </Stack>
    );
}

export default GABSA;