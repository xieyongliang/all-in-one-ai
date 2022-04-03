import { Badge, Box, Card, Container } from 'aws-northstar';
import { FunctionComponent, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { useHistory } from 'react-router-dom';
import Image from '../Utils/Image'
import CustomForm from './create';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../store/industrialmodels/reducer';
import { AppState } from '../../store';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

interface IProps {
    industrialModels: IIndustrialModel[];
}

const IndustrialModelOverview: FunctionComponent<IProps> = (props) => {
    const [ visibleCustom, setVisibleCustom ] = useState(false)
    const [ itemsModels, setItemsModels ] = useState([])
    const history = useHistory();

    const onCreate = () => {
        setVisibleCustom(true);
    }

    const getHttpUri = async (s3uri) => {
        var response = await axios.get('/s3', {params: {s3uri: s3uri}})
        return response.data
    }

    var industrialModels = props.industrialModels

    useEffect(() => {
            var items = []
            industrialModels.forEach((item) => {
                var s3uri = item.icon;
                getHttpUri(s3uri).then((data) => {
                    items.push({id: item.id, name: item.name, description: item.description, algorithm: item.algorithm, s3uri: s3uri, httpuri: data.payload, samples: item.samples});
                    if(items.length === industrialModels.length)
                        setItemsModels(items)
                })
            })
     }, [industrialModels])

    const onDelete = (event) => {
        alert('remove...')
        event.stopPropagation();
    }

    const onEdit = (event) => {
        alert('edit...')
        event.stopPropagation();
    }
 
    if(visibleCustom)
        return <CustomForm/>
    
    return (
        <Stack>
            <Container title='You can simply start from the existing industrial models.'>
                <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {
                        itemsModels.map((item) => { 
                            return (
                                <Grid item xs={2} sm={4} md={4}>
                                    <Box>
                                        <Card title={item.name} subtitle={item.description} withHover onClick={()=>{history.push(`/imodels/${item.id}?tab=demo#sample`)}}>
                                        <Stack direction='row' spacing={5}>
                                                <Image width={128} height={128} src={item.httpuri} current='' public={true} />
                                                <Stack direction="column" spacing={2}>
                                                    <Badge content={item.algorithm} color="blue" />
                                                    <Button variant="contained" size="small" startIcon={<DeleteIcon />} onClick={onDelete}>Delete</Button>
                                                    <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={onEdit}>Edit</Button>
                                                </Stack>
                                            </Stack>
                                        </Card>
                                    </Box>
                                </Grid>
                            )
                        })       
                    }
                </Grid>
            </Container>
            <Container title='You can also create your own industrial model based on the existing algorithms.'>
                <Button onClick={onCreate}> Create your own industrial model </Button>
            </Container>
        </Stack>
    )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(IndustrialModelOverview);