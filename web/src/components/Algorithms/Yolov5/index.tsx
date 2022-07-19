import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';
import cognitoUtils from '../../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../../store';

interface IProps {
    isLogin: boolean;
    env: Object;
}

const Yolov5: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    if(env['cognitoRegion'] === '' || isLogin)
        return (
            <Stack>
                <Container title='About Yolov5'>
                    <Text> 
                    YOLOv5 🚀 is a family of object detection architectures and models pretrained on the COCO dataset, and represents Ultralytics open-source research into future vision AI methods, incorporating lessons learned and best practices evolved over thousands of hours of research and development.
                    </Text>
                    <img src='/yolov5.jpg' width='50%' alt=''></img>
                </Container>
                <Container title = 'Yolov5 project'>
                    <Text>
                        Check out <Link href='https://github.com/ultralytics/yolov5'> Yolov5 </Link> for source code and full documentation on training, testing and deployment.
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
)(Yolov5);