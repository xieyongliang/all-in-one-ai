import { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Stack, LoadingIndicator } from 'aws-northstar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import axios from 'axios';
import Image from '../../Utils/Image';
import { PathParams } from '../../Interfaces/PathParams';
import Pagination from '@mui/material/Pagination';  
import '../../Utils/Image/index.scss'
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { Box, Dialog } from '@material-ui/core';
import LocaChartlDataForm from '../LocalData/chart';
import LocalImageDataForm from '../LocalData/image';
import { useTranslation } from "react-i18next";

interface IProps {
    type: string;
    infer_type: string;
    with_init_image?: boolean;
    industrialModels: IIndustrialModel[];
    header: string;
    train_framework: string;
    deploy_framework: string;
}

const PAGE_SIZE = 20;

const SampleDataForm: FunctionComponent<IProps>  = (
    {
        type,
        infer_type,
        with_init_image,
        industrialModels,
        header,
        train_framework,
        deploy_framework
    }) => {
    const [ textItems, setTextItems ] = useState([]);
    const [ curTextItem, setCurTextItem ] = useState('');
    const [ data, setData ] = useState(type === 'json' ? '{}' : '');
    const [ textPage, setTextPage ] = useState(1);
    const [ textCount, setTextCount ] = useState(0);
    const [ loading, setLoading ] = useState(false);
    const [ processing, setProcessing ] = useState(false);
    
    const { t } = useTranslation();

    var params : PathParams = useParams();

    useEffect(() => {
        if(industrialModels.length > 0) {
            var index = industrialModels.findIndex((item) => item.id === params.id)
            var s3uri = industrialModels[index].samples
            if(s3uri !== '') {
                setLoading(true)
                axios.get('/s3', {params : { s3uri : s3uri, page_num: textPage, page_size: PAGE_SIZE, include_filter : 'json' }})
                    .then((response) => {
                        setTextItems(response.data.payload);
                        setTextCount(response.data.count);
                        setLoading(false);
                    })
            }
        }
    },[params.id, textPage, industrialModels]);

    const onImageClick = (httpuri) => {
        setCurTextItem(httpuri)
        setProcessing(true)
        axios.get('/_file/download', {params: {uri: encodeURIComponent(httpuri)}, responseType: 'blob'}).then((response) => {
            response.data.text().then((text) => {
                setData(text);
                setProcessing(false);
            })
        })
    }

    const onChange = (httpuri, event) => {
        if(httpuri === 'formFieldIdPage')
            setTextPage(event)
    }
    
    const renderImageList = () => {
        if(loading)
            return (
                <Container title = {t('industrial_models.demo.sample_data')}>
                    <LoadingIndicator label={t('industrial_models.demo.loading')}/>
                </Container>
            )
        else if(processing)
            return (
                <Dialog open={true}>
                    <Box p={3}>
                        <LoadingIndicator label={t('industrial_models.demo.processing')}/>
                    </Box>
                </Dialog>
            )
        else {
            return (
                <Stack>
                    <Container title = {t('industrial_models.demo.sample_data')}>
                        <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                            {
                                textItems.length > 0 && 
                                textItems.map((item) => (
                                    <ImageListItem key={item.httpuri} rows={2}>
                                        <Image
                                            src={'/json.jpeg'}
                                            httpuri={item.httpuri}
                                            tooltip={`bucket=${item.bucket}\r\nkey=${item.key}`}
                                            width={128}
                                            height={128}
                                            current={curTextItem}
                                            onClick={onImageClick}
                                        />
                                    </ImageListItem>
                                ))
                            }
                        </ImageList>
                        <div style={{textAlign: "center"}}>
                            <div style={{display: "inline-block", margin: "auto"}}>
                                <Pagination page={textPage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.ceil(textCount / PAGE_SIZE)} />
                            </div>
                        </div>
                    </Container>         
                </Stack>
            )
        }
    }

    return (
        <Stack>
            { renderImageList() }
            { type === 'chart' && <LocaChartlDataForm header={header} data={data} train_framework={train_framework} deploy_framework={deploy_framework}/> }
            { type !== 'chart' && <LocalImageDataForm with_init_image={with_init_image} infer_type={infer_type} header={header} data={data} train_framework={train_framework} deploy_framework={deploy_framework}/> }
        </Stack>
    )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(SampleDataForm);