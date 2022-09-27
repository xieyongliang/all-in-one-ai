import { RankImageData } from '../store/ranks/types';
import { v4 as uuidv4 } from 'uuid';
import { FileUtil } from './FileUtil';
import { ImageRepository } from '../logic/imageRepository/ImageRepository';

export class RankImageDataUtil {
    public static createRankImageDataFromFileData(fileData: File): RankImageData {
        return {
            id: uuidv4(),
            fileData,
            loadStatus: false,
            rank: ''
        }
    }

    public static cleanAnnotations(item: RankImageData): RankImageData {
        return {
            ...item,
            rank : ''
        }
    }
        
    public static arrange(items: RankImageData[], idArrangement: string[]): RankImageData[] {
        return items.sort((a: RankImageData, b: RankImageData) => {
            return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id)
        })
    }

    public static loadMissingImages(images: RankImageData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const missingImages = images.filter((i: RankImageData) => !i.loadStatus);
            const missingImagesFiles = missingImages.map((i: RankImageData) => i.fileData);
            FileUtil.loadImages(missingImagesFiles)
                .then((htmlImageElements:HTMLImageElement[]) => {
                    ImageRepository.storeImages(missingImages.map((i: RankImageData) => i.id), htmlImageElements);
                    resolve()
                })
                .catch((error: Error) => reject(error));
        });
    }
}
