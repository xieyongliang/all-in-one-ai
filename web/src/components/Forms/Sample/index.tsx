import { FunctionComponent, MouseEventHandler, useEffect, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import axios from 'axios';
import { Button, Container, FormField, Inline, Modal, Stack } from 'aws-northstar';
import URLImage from '../../Utils/URLImage';
import ImageAnnotate from '../../Utils/Annotate';
import {LABELS, COLORS} from '../../Data/data';

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
    const [id, setId] = useState<number[]>([])
    const [bbox, setBbox] = useState<number[][]>([])
    const [visibleAnnotate, setVisibleAnnotate] = useState(false);
    
    const onImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        const src = event.currentTarget.src
        const filename = src.substring(src.lastIndexOf('/') + 1)
        setCurrent(src)
        setFilename(filename)
        setId([]);
        setBbox([]);
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
            var tbbox : number[][] = [];
            var tid = [];
            for(let item of response.data) {
                var numbers = item.split(' ');
                tid.push(parseInt(item[0]));
                var box : number[] = [];
                box.push(parseFloat(numbers[1]));
                box.push(parseFloat(numbers[2]));
                box.push(parseFloat(numbers[3]));
                box.push(parseFloat(numbers[4]));
                tbbox.push(box);
            }
            setId(tid);
            setBbox(tbbox);
        }, (error) => {
            console.log(error);
        });
    }
    
    const onAnnotate = () => {
        setVisibleAnnotate(true);
    }

    if(visibleAnnotate) {
        var annotationData : string[] = [];
        var index = 0;
        bbox.forEach(item => {
            var annotation : string = id[index] + ' ' + item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3] + '\r';
            annotationData.push(annotation);
            index++;
        });
        var labelsData : string[] = [];
        LABELS.forEach(label => {
            labelsData.push(label + '\r');
        })
        
        return (
            <Container title = "Image annotation">
                <ImageAnnotate imageUri={current} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant="primary" onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
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
                        <Button variant="primary" onClick={onInference} disabled={filename === ''}>Inference</Button>
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
                        <URLImage src={current} colors={COLORS} labels={LABELS} id={id} bbox={bbox}/>
                    </FormField>
                    <Inline>
                        <FormField controlId='button'>
                            <Button variant="primary" onClick={onInference} disabled={filename === ''}>Inference</Button>
                        </FormField>
                        <FormField controlId='button'>
                            <Button onClick={onAnnotate} disabled={bbox.length === 0}>Annotate</Button>
                        </FormField>
                    </Inline>
                </Container>
            </Stack>
    )
}

export default SampleForm;