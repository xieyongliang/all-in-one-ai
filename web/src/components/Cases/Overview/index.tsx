import { Box, Button, Card, Container, Stack } from "aws-northstar";
import { FunctionComponent } from "react";
import Grid from '@mui/material/Grid';
import { useHistory } from "react-router-dom";
import Image from '../../Utils/Image';

const CaseOverview: FunctionComponent = () => {
    const history = useHistory();

    return (
        <Stack>
            <Container title='You can simply start from the existing use cases.'>
                <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <Box>
                            <Card title="Track detection" subtitle="Yolov5" withHover onClick={()=>{history.push('/case/track?tab=demo#sample')}}>
                                <Image width={128} height={128} src='track.png' current='' public={true} /> 
                            </Card>
                        </Box>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <Box>
                            <Card title="Mask detection" subtitle="Yolov5" withHover onClick={()=>{history.push('/case/mask?tab=demo#sample')}}>
                                <Image width={128} height={128} src='mask.jpeg' current='' public={true} /> 
                            </Card>
                        </Box>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <Box>
                            <Card title="Helmet detection" subtitle="Yolov5" withHover>
                                <Image width={128} height={128} src='helmet.png' current='' public={true} /> 
                            </Card>
                        </Box>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <Box>
                            <Card title="Receipt recognition" subtitle="Paddle" withHover>
                                <Image width={128} height={128} src='receipt.jpeg' current='' public={true} /> 
                            </Card>
                        </Box>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <Box>
                            <Card title="Insurance resport recognition" subtitle="Paddle" withHover>
                                <Image width={128} height={128} src='report.png' current='' public={true} /> 
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
            <Container title="You can also create your own use case based on the existing models.">
                <Button> Create your own use case </Button>
            </Container>
        </Stack>
    )
}

export default CaseOverview;