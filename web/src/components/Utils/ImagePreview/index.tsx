import { Modal } from 'aws-northstar';
import { FunctionComponent } from 'react';
import Image from '../Image';

export interface ImagePreviewProps {
    src: string;
    alt?: string;
    width: number | string;
    height: number | string;
    visible: boolean;
    onClose: () => any;
}

const ImagePreview: FunctionComponent<ImagePreviewProps> = (props) => {
    return (
        <Modal title="Modal" visible={props.visible} onClose={props.onClose}>
            <Image src={props.src} width={props.width} height={props.height} current={''}/>
        </Modal>
    )
}

export default ImagePreview;