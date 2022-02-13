import { FunctionComponent, MouseEventHandler, useEffect, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import { Button, Container, FormField, Stack } from 'aws-northstar';
import URLImage from '../../Utils/URLImage';
var fs = require('fs');

type OnClick = (event: React.MouseEvent<HTMLImageElement>) => void

interface ImageProps {
    src: string;
    width: number;
    height: number;
    current: string;
    onClick?: OnClick;
}

const Image: FunctionComponent<ImageProps> = (props) => {
    if(props.current.endsWith(props.src))
        return (
            <img
                    src={props.src}
                    width={props.width}
                    height={props.height}
                    loading="lazy"
                    onClick={props.onClick}
                    style={{"border": "5px solid red"}}
                />
        )
    else
        return (
            <img
                    src={props.src}
                    width={props.width}
                    height={props.height}
                    loading="lazy"
                    onClick={props.onClick}
                />
        )
}

const SampleForm: FunctionComponent = () => {
    const [items, setItems] = useState<string[]>([])
    const [current, setCurrent] = useState('')
    const [filename, setFilename] = useState('')
    const [label, setLabel] = useState<string[]>([])
    const [bbox, setBbox] = useState<string[][]>([[]])
    
    const onImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        const src = event.currentTarget.src
        const filename = src.substring(src.lastIndexOf('/') + 1)
        setCurrent(src)
        setFilename(filename)
        setLabel([]);
    }

    useEffect(() => {
        axios.get('/samples')
            .then((response) => {
            var items : string[] = []
            for(let item of response.data) {
                items.push(item)
            }
            setItems(items);
            console.log(items);
        }, (error) => {
            console.log(error);
        });
    }, [])

    const onInference = () => {
        axios.get('/inference/sample/' + filename)
        .then((response) => {
            var tlabel = [];
            var tbbox = [];
            for(let item of response.data) {
                tlabel.push(item.label)
                var numbers = item.bbox.toString().split(',');
                tbbox.push(numbers);
            }
            setLabel(tlabel);
            setBbox(tbbox);
        }, (error) => {
            console.log(error);
        });
    }

    if(filename === '')
        return (
            <Stack>
                <Container title = "Select image file from sample list">
                    <ImageList cols={12} rowHeight={128} gap={10} variant={'quilted'} style={{"height":"550px"}}>
                        {items.map((item, index) => (
                            <ImageListItem key={item} rows={2}>
                            <Image
                                src={item}
                                width={128}
                                height={256}
                                current={current}
                                onClick={onImageClick}
                            />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Container>
                <Container title = "Start inference">
                    <FormField controlId='button'>
                        <Button variant="primary" onClick={onInference}>Inference</Button>
                    </FormField>
                </Container>
            </Stack>
        )
    else
        return (
            <Stack>
                <Container title = "Select image file from sample list">
                    <ImageList cols={12} rowHeight={128} gap={10} variant={'quilted'} style={{"height":"550px"}}>
                        {items.map((item, index) => (
                            <ImageListItem key={item} rows={2}>
                            <Image
                                src={item}
                                width={128}
                                height={256}
                                current={current}
                                onClick={onImageClick}
                            />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Container>
                <Container title = "Start inference">
                    <FormField controlId='button'>
                        <URLImage src={current} label={label} bbox={bbox}/>
                    </FormField>
                    <FormField controlId='button'>
                        <Button variant="primary" onClick={onInference}>Inference</Button>
                    </FormField>
                </Container>
            </Stack>
    )
}

export default SampleForm;