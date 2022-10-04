import { GenericImageData } from '../store/genericimages/types';
import { v4 as uuidv4 } from 'uuid';
import { FileUtil } from './FileUtil';
import { ImageRepository } from '../logic/imageRepository/ImageRepository';

export class GenericImageDataUtil {
    public static createGenericImageDataFromFileData(fileData: File): GenericImageData {
        return {
            id: uuidv4(),
            fileData,
            loadStatus: false,
            value: ''
        }
    }

    public static cleanAnnotations(item: GenericImageData): GenericImageData {
        return {
            ...item,
            value : ''
        }
    }
        
    public static arrange(items: GenericImageData[], idArrangement: string[]): GenericImageData[] {
        return items.sort((a: GenericImageData, b: GenericImageData) => {
            return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id)
        })
    }

    public static loadMissingImages(images: GenericImageData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const missingImages = images.filter((i: GenericImageData) => !i.loadStatus);
            const missingImagesFiles = missingImages.map((i: GenericImageData) => i.fileData);
            FileUtil.loadImages(missingImagesFiles)
                .then((htmlImageElements:HTMLImageElement[]) => {
                    ImageRepository.storeImages(missingImages.map((i: GenericImageData) => i.id), htmlImageElements);
                    resolve()
                })
                .catch((error: Error) => reject(error));
        });
    }
}
