import { Modal } from 'aws-northstar';
import { FunctionComponent } from 'react';
import Image from '../Image';
import { useTranslation } from "react-i18next";

export interface ImagePreviewProps {
    src: string;
    alt?: string;
    width: number | string;
    height: number | string;
    visible: boolean;
    onClose: () => any;
}

const ImagePreview: FunctionComponent<ImagePreviewProps> = (props) => {
    const { t } = useTranslation();
    
    return (
        <Modal title={t('industrial_models.demo.image_preview')} visible={props.visible} onClose={props.onClose} width={"100"}>
            <Image 
                src={props.src} 
                httpuri={props.src}
                width={props.width} 
                height={props.height} 
                current={''}
            />
        </Modal>
    )
}

export default ImagePreview;