import { FunctionComponent, useEffect, useRef, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import axios from 'axios';
import { Button, Container, FormField, Inline, Stack } from 'aws-northstar';
import URLImage from '../../Utils/URLImage';
import ImageAnnotate from '../../Utils/Annotate';
import Image from '../../Utils/Image';
import {LABELS, COLORS, CaseType} from '../../Data/data';
import { PathParams } from '../../Interfaces/PathParams';
import { useParams } from 'react-router-dom';

const SampleForm: FunctionComponent = () => {
    const [items, setItems] = useState<string[]>([])
    const [current, setCurrent] = useState('')
    const [filename, setFilename] = useState('')
    const [id, setId] = useState<number[]>([])
    const [bbox, setBbox] = useState<number[][]>([])
    const [visibleAnnotate, setVisibleAnnotate] = useState(false);
    const [labels, setLabels] = useState([])
    const casename = useRef('');

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        axios.get('/samples/' + params.name)
        .then((response) => {
            var items : string[] = []
            for(let item of response.data) {
                items.push(item)
            }
            setItems(items);
            setFilename('');
            setVisibleAnnotate(false);
            if(params.name === 'track')
                setLabels(LABELS[CaseType.TRACK])
            else if(params.name === 'mask')
                setLabels(LABELS[CaseType.FACE])    
        }, (error) => {
            console.log(error);
        });
    },[params.name]);

    const onImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        const src = event.currentTarget.src
        const filename = src.substring(src.lastIndexOf('/') + 1)
        setCurrent(src)
        setFilename(filename)
        setId([]);
        setBbox([]);
    }

    const onInference = () => {
        axios.get('/inference/sample/' + params.name + '/' + filename)
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
        labels.forEach(label => {
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
                    <ImageList cols={12} rowHeight={64} gap={10} variant={'quilted'} style={{"height":"550px"}}>
                        {items.map((item, index) => (
                            <ImageListItem key={item} rows={2}>
                            <Image
                                src={item}
                                width={128}
                                height={128}
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
                    <ImageList cols={12} rowHeight={64} gap={10} variant={'quilted'} style={{"height":"550px"}}>
                        {items.map((item, index) => (
                            <ImageListItem key={item} rows={2}>
                            <Image
                                src={item}
                                width={128}
                                height={128}
                                current={current}
                                onClick={onImageClick}
                            />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Container>
                <Container title = "Preview">
                    <FormField controlId='button'>
                        <URLImage src={current} colors={COLORS} labels={labels} id={id} bbox={bbox}/>
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