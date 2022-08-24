import { FunctionComponent, useEffect, useState } from 'react';
import { Button, LoadingIndicator, Stack } from 'aws-northstar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import axios from 'axios';
import ImageAnnotate from '../ImageAnnotate';
import Image from '../Image';
import { COLORS } from '../../Data/data';
import Pagination from '@mui/material/Pagination';  
import '../../Utils/Image/index.scss'
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';

const OVERLAY_STYLE = {
    position: "fixed" as 'fixed',
    display: "block",
    justifyContent: "center",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    paddingLeft: "5px",
    backgroundColor: "white",
    zIndex: "4000",
    overflow: "auto"
};
  
const PAGE_SIZE = 50

interface IProps {
    s3uri: string;
    labels: string[];
    projectName: string;
    pageSize?: number;
    onClose: () => any;
}  

const ImagePanel: FunctionComponent<IProps> = ({
    s3uri,
    labels,
    projectName,
    pageSize,
    onClose
}) => {
    const [ imageItems, setImageItems ] = useState([])
    const [ activeIndex, setActiveIndex ] = useState(0)
    const [ imagePage, setImagePage ] = useState(1)
    const [ imageCount, setImageCount ] = useState(0)
    const [ loading, setLoading ] = useState(false);
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false)

    if(pageSize === undefined)
        pageSize = PAGE_SIZE;
    
    useEffect(() => {
        if(s3uri !== '') {
            setLoading(true)
            axios.get('/s3', {params : { s3uri : s3uri, page_num: imagePage, page_size: pageSize }})
                .then((response) => {
                    setImageItems(response.data.payload);
                    setImageCount(response.data.count);
                    setLoading(false);
                })
        }
    },[imagePage, pageSize, s3uri]);

    const onImageClick = (src) => {
        setActiveIndex(imageItems.findIndex((item) => item.httpuri === src))
        setVisibleImagePreview(true)
    }

    const onImageClose = () => {
        setVisibleImagePreview(false);
    }

    const onChange = (id, event) => {
        if(id === 'formFieldIdPage')
            setImagePage(event)
    }

    const renderImagePreview = () => {
        var labelsData : string[] = [];
        labels.forEach(label => {
            labelsData.push(label + '\n');
        })

        var imageNames = []
        var imageBuckets = []
        var imageKeys = []
        imageItems.forEach((imageItem) => {
            var imageBucket = imageItem.bucket;
            var imageKey = imageItem.key;
    
            var imageName = imageKey.substring(imageKey.lastIndexOf('/') + 1, imageKey.lastIndexOf('.'))
            imageBuckets.push(imageBucket)
            imageKeys.push(imageKey)
            imageNames.push(imageName)
        })

        var imageUris = []
        imageItems.forEach((item) => {
            imageUris.push(item.httpuri)
        })

        return (
            <ImageAnnotate 
                imageUris = {imageUris} 
                imageLabels = {labelsData} 
                imageColors = {COLORS} 
                imageBuckets = {imageBuckets} 
                imageKeys = {imageKeys}
                imageNames = {imageNames}
                projectName = {projectName}
                activeIndex = {activeIndex}
                type = {ProjectType.OBJECT_DETECTION_RECT}
                subType = {ProjectSubType.BATCH_LABEL}
                onClosed = {onImageClose}
            />
        )
    }
    
    const renderImageList = () => {
        if(loading)
            return (
                <LoadingIndicator label='Loading...'/>
            )
        else {
            return (
                <div>
                    <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                        {
                            imageItems.length > 0 && 
                            imageItems.map((item) => (
                                <ImageListItem key={item.httpuri} rows={2}>
                                    <Image
                                        src={item.httpuri}
                                        tooltip={`bucket=${item.bucket}\r\nkey=${item.key}`}
                                        width={128}
                                        height={128}
                                        current={imageItems[activeIndex].httpuri}
                                        onClick={onImageClick}
                                    />
                                </ImageListItem>
                            ))
                        }
                    </ImageList>
                    <div style={{textAlign: "center"}}>
                        <div style={{display: "inline-block", margin: "auto"}}>
                            <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.ceil(imageCount / pageSize)} />
                        </div>
                        <div style={{display: "inline-block", float: "right", marginRight: "5px"}}>
                            <Button onClick={onClose}>Exit batch annotation</Button>
                        </div>
                    </div>
                </div>
            )
        }
    }

    if(visibleImagePreview)
        return (
            <Stack>
                { renderImagePreview() }
            </Stack>
        )
    else
        return (
            <div style={OVERLAY_STYLE}>
                { renderImageList() }
            </div>
        )
}

export default ImagePanel;