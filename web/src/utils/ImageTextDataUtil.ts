import {ImageTextData} from '../store/texts/types';
import { v4 as uuidv4 } from 'uuid';
import {FileUtil} from './FileUtil';
import {ImageRepository} from '../logic/imageRepository/ImageRepository';

export class ImageTextDataUtil {
    public static createImageTextDataFromFileData(fileData: File): ImageTextData {
        return {
            id: uuidv4(),
            fileData,
            loadStatus: false,
            textRects: []
        }
    }

    public static cleanAnnotations(item: ImageTextData): ImageTextData {
        return {
            ...item,
            textRects : []
        }
    }

    public static arrange(items: ImageTextData[], idArrangement: string[]): ImageTextData[] {
        return items.sort((a: ImageTextData, b: ImageTextData) => {
            return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id)
        })
    }

    public static loadMissingImages(images: ImageTextData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const missingImages = images.filter((i: ImageTextData) => !i.loadStatus);
            const missingImagesFiles = missingImages.map((i: ImageTextData) => i.fileData);
            FileUtil.loadImages(missingImagesFiles)
                .then((htmlImageElements:HTMLImageElement[]) => {
                    ImageRepository.storeImages(missingImages.map((i: ImageTextData) => i.id), htmlImageElements);
                    resolve()
                })
                .catch((error: Error) => reject(error));
        });
    }
}
