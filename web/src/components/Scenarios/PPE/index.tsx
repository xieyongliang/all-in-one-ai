import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import { store } from '../../..';

const PPE: FunctionComponent = () => {
    if(store.getState().general.env['cognitoRegion'] === '' || store.getState().session.isLogin)
        return (
            <Stack>
                <Container title='About PPE'>
                    <Text> 
                    Personal protective equipment, commonly referred to as 'PPE', is equipment worn to minimize exposure to hazards that cause serious workplace injuries and illnesses. These injuries and illnesses may result from contact with chemical, radiological, physical, electrical, mechanical, or other workplace hazards. Personal protective equipment may include items such as gloves, safety glasses and shoes, earplugs or muffs, hard hats, respirators, or coveralls, vests and full body suits.
                    </Text>
                </Container>
                <Container title = 'AWS PPE detection solution'>
                    <Text>
                    A suite of PPE Detector hardware + AI + 3rd party service solutions. It aims to transform the existing physical assets of manufacturing enterprises into smart assets. For example, there are many
    IP camera system. These cameras are primarily used to record video capabilities in fixed physical areas and do not have the ability to actively monitor, for example, whether workers are wearing safety helmets correctly.
    Using the out-of-the-box AI kit, you can connect these IP cameras to the kit, and the AI model in the kit can identify the worker's helmet wearing in the video in real time. Once sent
    If you violate the rules (without wearing a helmet), an alarm message will be automatically sent to the manager's corporate WeChat, and picture evidence will be provided.                </Text>
                </Container>
                <Container title = 'Architecture diagram'>
                    <img src='/ppe.png' width ='1000' alt=''></img>
                </Container>
                <Container title = 'Reference Website'>
                <Text>
                        Check out <Link href='https://cn.spot-bot.examples.pro'> PPE Detection </Link> for demostration.
                    </Text>
                </Container>
            </Stack>
        );
    else
        return (
            <div />
        )
}

export default PPE;