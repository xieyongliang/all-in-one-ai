import { Container, DeleteConfirmationDialog, LoadingIndicator, Text } from 'aws-northstar';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { AppState } from '../../../store';
import axios from 'axios';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IndustrialModelForm from '../../Forms/IndustrialModel'
import IndustrialModelProp from '../../Props/IndustrialModel'
import { Updateindustrialmodels } from '../../../store/industrialmodels/actionCreators';
import MenuItem from "@material-ui/core/MenuItem";
import { Edit, Delete } from '@mui/icons-material';
import { ListItemIcon, ListItemText, Menu, MenuList, Button, IconButton, Typography, Stack, Card, CardHeader, CardMedia, CardContent, CardActions  } from '@mui/material';
import { useHistory } from 'react-router-dom';

interface IProps {
    updateIndustrialModelsAction: (industrialModels: IIndustrialModel[]) => any;
    industrialModels: IIndustrialModel[];
}

const IndustrialModelList: FunctionComponent<IProps> = (props) => {
    const [ itemsModels, setItemsModels ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ industrialModel, setIndustrialModel ] = useState<IIndustrialModel>()
    const [ visibleIndustrialModelForm, setVisibleIndustrialModelForm ] = useState(false)
    const [ visibleIndustrialModelProp, setVisibleIndustrialModelProp ] = useState(false)
    const [ visibleConfirmationDialog, setVisibleConfirmationDialog ] = useState(false)
    const [ processing, setProssing ] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);

    const history = useHistory();
    
    const open = Boolean(anchorEl);

    const onCreate = () => {
        setVisibleIndustrialModelForm(true)
    }

    const onClose = () => {
        if(visibleIndustrialModelForm)
            setVisibleIndustrialModelForm(false)
        if(visibleIndustrialModelProp)
            setVisibleIndustrialModelProp(false)
    }

    const getHttpUri = async (s3uri) => {
        var response = await axios.get('/s3', {params: {s3uri: s3uri}})
        return response.data
    }

    var industrialModels = props.industrialModels

    const onRefresh = useCallback(()=> {
        var items = []
        industrialModels.forEach((item) => {
            var s3uri = item.icon;
            getHttpUri(s3uri).then((data) => {
                items.push({id: item.id, name: item.name, description: item.description, algorithm: item.algorithm, icon: s3uri, httpuri: data.payload, samples: item.samples, labels: item.labels});
                if(items.length === industrialModels.length) {
                    setItemsModels(items)
                    setLoading(false)
                }
            })
        })
    }, [industrialModels])

    const handleClose = () => {
        setAnchorEl(null);
      };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    useEffect(() => {
        onRefresh()
     }, [onRefresh])

    const onDelete = (event, item) => {
        setIndustrialModel(item)
        setVisibleConfirmationDialog(true)
        event.stopPropagation();
        setAnchorEl(null);
    }

    const onEdit = (event, item) => {
        setIndustrialModel(item)
        setVisibleIndustrialModelProp(true)
        event.stopPropagation();
        setAnchorEl(null);
    }
 
    const renderIndustrialModelTable = () => {
        if(loading) 
            return (
                <Container title='You can simply start from the existing industrial models.'>
                    <LoadingIndicator label='Loading...'/>
                </Container>
            )
        else 
            return (
                <Container title='You can simply start from the existing industrial models.'>
                    <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        {
                            itemsModels.map((item) => { 
                                return (
                                    <Grid item xs={3} sm={3} md={3}>
                                        <Card sx ={{hegith: 450}} >
                                        <CardHeader sx={{
                                                height: 60
                                            }}
                                            action={
                                            <IconButton aria-label="settings" onClick={handleClick}>
                                                <MoreVertIcon />
                                            </IconButton>
                                            }
                                            title={item.name}
                                            subheader={item.algorithm}
                                        />
                                        <MenuList>
                                        <Menu 
                                            anchorEl={anchorEl} 
                                            keepMounted onClose={handleClose} 
                                            open={open}>    
                                            <MenuItem
                                                key='Edit' 
                                                onClick={(event)=>onEdit(event, item)}>
                                                <ListItemIcon>
                                                    <Edit fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Edit</ListItemText>
                                            </MenuItem>
                                            <MenuItem
                                                key='Delete' 
                                                onClick={(event)=>onDelete(event, item)}>
                                                <ListItemIcon>
                                                    <Delete fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Delete</ListItemText>
                                            </MenuItem>
                                        </Menu>
                                        </MenuList>
                                        <CardMedia
                                            component="img"
                                            height = {'360px'}
                                            width = {'auto'}
                                            image={item.httpuri}
                                            alt={item.description}
                                        />
                                        <CardContent >
                                            <Typography variant="body2" color="text.secondary" sx ={{hegith: 90}}>
                                            {item.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button size="large" variant="contained" onClick={()=>{history.push(`/imodels/${item.id}?tab=demo#sample`)}}>Try it</Button>
                                        </CardActions>
                                        </Card>
                                    </Grid>
                                )
                            })       
                        }
                    </Grid>
                </Container>
            )
        
    }

    const renderCreateIndustrialModel = () => {
        return (
            <Container title='You can also create your own industrial model based on the existing algorithms.'>
                <Button onClick={onCreate}> Create your own industrial model </Button>
            </Container>
        )
    }

    const deleteIndustrialModel = () => {
        setProssing(true)
        axios.delete(`/industrialmodel/${industrialModel.id}`, {params: {model_algorithm: industrialModel.algorithm}})
            .then((response) => {
                var industrialModels = props.industrialModels
                props.updateIndustrialModelsAction(industrialModels.filter((item) => item.id !== industrialModel.id))
                onRefresh()
                setVisibleConfirmationDialog(false)
                setProssing(false)
            }, (error) => {
                    alert(error)
                }
            )
    }

    const renderDeleteConfirmationDialog = () => {
        return (
            <DeleteConfirmationDialog
                variant="confirmation"
                visible={visibleConfirmationDialog}
                title={`Delete ${industrialModel.name}`}
                onCancelClicked={()=>setVisibleConfirmationDialog(false)}
                onDeleteClicked={deleteIndustrialModel}
                loading={processing}
            >
                <Text>This will permanently delete your industrial model and cannot be undone. This may affect other resources.</Text>
            </DeleteConfirmationDialog>
        )
    }

    if(visibleIndustrialModelForm)
        return (
            <IndustrialModelForm onClose={onClose}/>
        )
    else if(visibleIndustrialModelProp)
        return (
            <IndustrialModelProp industrialModel={industrialModel} onClose={onClose}/>
        )
    else
        return (
            <Stack>
                { visibleConfirmationDialog && renderDeleteConfirmationDialog() }
                { renderIndustrialModelTable() }
                { renderCreateIndustrialModel() }
            </Stack>
        )
    
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

const mapDispatchToProps = {
    updateIndustrialModelsAction: Updateindustrialmodels
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IndustrialModelList);