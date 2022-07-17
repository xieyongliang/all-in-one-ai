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
import { red } from '@mui/material/colors';
import { ListItemIcon, ListItemText, Menu, MenuList, Button, IconButton, Typography, Stack, Card, CardHeader, CardContent, CardActions, Avatar  } from '@mui/material';
import { useHistory } from 'react-router-dom';
import Image from '../../Utils/Image';

interface IProps {
    updateIndustrialModelsAction: (industrialModels: IIndustrialModel[]) => any;
    industrialModels: IIndustrialModel[];
    isLogin: boolean;
}

const IndustrialModelList: FunctionComponent<IProps> = (props) => {
    const [ itemsModels, setItemsModels ] = useState([])
    const [ loading, setLoading ] = useState(false)
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
        if(industrialModels.length > 0) {
            setLoading(true)
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
        }
    }, [industrialModels])

    const handleClose = () => {
        setAnchorEl(null);
      };

    const handleClick = (event, industrialModel) => {
        setIndustrialModel(industrialModel)
        setAnchorEl(event.currentTarget);
    };
    
    useEffect(() => {
        onRefresh()
     }, [onRefresh])

    const onDelete = () => {
        setVisibleConfirmationDialog(true)
        setAnchorEl(null);
    }

    const onEdit = () => {
        setVisibleIndustrialModelProp(true)
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
                            itemsModels
                                .sort((itemModel1 : IIndustrialModel, itemModel2: IIndustrialModel) => {
                                    if(itemModel1.name > itemModel2.name)
                                        return 1;
                                    else if(itemModel1.name === itemModel2.name)
                                        return 0;
                                    else
                                        return -1;
                                })
                                .map((itemModel) => {
                                return (
                                    <Grid item xs={4} sm={4} md={4}>
                                        <Card sx ={{hegith: 400}} key={itemModel.id} >
                                            <CardHeader sx={{
                                                    height: 60
                                                }}
                                                avatar={
                                                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                                                        AI
                                                    </Avatar>
                                                }
                                                action={
                                                <IconButton aria-label="settings" onClick={(event) => handleClick(event, itemModel)}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                                }
                                                title={itemModel.name}
                                                subheader={itemModel.algorithm}
                                            />
                                            <MenuList>
                                            <Menu 
                                                anchorEl={anchorEl} 
                                                keepMounted onClose={handleClose} 
                                                open={open}>    
                                                <MenuItem
                                                    key={`Edit-${itemModel.id}`}
                                                    onClick={onEdit}>
                                                    <ListItemIcon>
                                                        <Edit fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText>Edit</ListItemText>
                                                </MenuItem>
                                                <MenuItem
                                                    key={`Delete-${itemModel.id}`}
                                                    onClick={onDelete}>
                                                    <ListItemIcon>
                                                        <Delete fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText>Delete</ListItemText>
                                                </MenuItem>
                                            </Menu>
                                            </MenuList>
                                            <CardContent >
                                                <Image src={itemModel.httpuri} height='192px' width='192px' public={true}></Image>
                                                <Typography variant="body2" color="text.secondary" sx ={{hegith: 90}}>
                                                {itemModel.description}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="large" variant="contained" onClick={()=>{history.push(`/imodels/${itemModel.id}?tab=demo#sample`)}}>Try it</Button>
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
                props.updateIndustrialModelsAction(props.industrialModels.filter((item) => item.id !== industrialModel.id))
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

    if(props.isLogin) {
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
    else
        return (
            <div></div>
        )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels,
    isLogin: state.session.isLogin
});

const mapDispatchToProps = {
    updateIndustrialModelsAction: Updateindustrialmodels
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IndustrialModelList);