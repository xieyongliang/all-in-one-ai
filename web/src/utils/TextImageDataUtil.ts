import { TextImageData } from '../store/texts/types';
import { v4 as uuidv4 } from 'uuid';
import { FileUtil } from './FileUtil';
import { ImageRepository } from '../logic/imageRepository/ImageRepository';

export class TextImageDataUtil {
    public static createTextImageDataFromFileData(fileData: File): TextImageData {
        return {
            id: uuidv4(),
            fileData,
            loadStatus: false,
            textRects: [],
            textPolygons: []
        }
    }

    public static cleanAnnotations(item: TextImageData): TextImageData {
        return {
            ...item,
            textRects : []
        }
    }

    public static arrange(items: TextImageData[], idArrangement: string[]): TextImageData[] {
        return items.sort((a: TextImageData, b: TextImageData) => {
            return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id)
        })
    }

    public static loadMissingImages(images: TextImageData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const missingImages = images.filter((i: TextImageData) => !i.loadStatus);
            const missingImagesFiles = missingImages.map((i: TextImageData) => i.fileData);
            FileUtil.loadImages(missingImagesFiles)
                .then((htmlImageElements:HTMLImageElement[]) => {
                    ImageRepository.storeImages(missingImages.map((i: TextImageData) => i.id), htmlImageElements);
                    resolve()
                })
                .catch((error: Error) => reject(error));
        });
    }
}
