import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';

const Track: FunctionComponent = () => {
    return (
        <Stack>
            <Container title='About track maintenance'>
                <Text> 
                Cameras installed on train underframe to detect crack running on East Rail Line(EAL). Photos captured by cameras will be used to detect track defects.
                </Text>
            </Container>
            <Container title = 'AWS track maintenance solution'>
                <ul dir="auto">
                    <li>Key Scope
                        <ul dir="auto">
                            <li>Optimize the alarm data connection in AWS</li>
                            <li>Alarm data sync to S3 for further data visualization development in Tableau</li>
                            <li>Develop ML models to meet the performance requirement</li>
                            <li>Manage the whole ML pipeline include building , training and deploying through MLOps approach with continuous learning feature</li>
                            <li>The System shall cover the existing EAL ORIS system and have the feasibility to extend to other future ORIS (SIL, TML, EAL by MerMec, KTL, TWL, LRV)</li>
                            <li>Web UI for showing the model result and allowing user to verify the result. </li>
                        </ul>
                    </li>
                    <li>Performance Requirement
                        <ul dir="auto">
                            <li>False alarm rate - Shall be able to reduce the false alarm rate at least by 50% (Recall &gt; 0.5)</li>
                            <li>Precision of predicting false alarm - The reduced false alarm shall be accurately identified by at least 95% (Precision &gt; 0.95)</li>
                        </ul>
                    </li>
                </ul>
            </Container>
            <Container title = 'Architecture diagram'>
                <img src='/track.png' width ='1000' alt=''></img>
            </Container>
            <Container title = 'Reference Website'>
            <Text>
                    Check out <Link href='https://track.spot-bot.examples.pro/'> Track maintenance </Link> for demostration.
                </Text>
            </Container>
        </Stack>
    );
}

export default Track;