import { FunctionComponent } from 'react';
import { Stack, Container, Text, Link } from 'aws-northstar';

const Yolov5: FunctionComponent = () => {
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
}

export default Yolov5;