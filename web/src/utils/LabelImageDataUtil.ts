import { LabelImageData } from '../store/labels/types';
import { v4 as uuidv4 } from 'uuid';
import { FileUtil } from './FileUtil';
import { ImageRepository } from '../logic/imageRepository/ImageRepository';

export class LabelImageDataUtil {
    public static createLabelImageDataFromFileData(fileData: File): LabelImageData {
        return {
            id: uuidv4(),
            fileData,
            loadStatus: false,
            labelRects: [],
            labelPoints: [],
            labelLines: [],
            labelPolygons: [],
            labelNameIds: [],
            isVisitedByObjectDetector: false,
            isVisitedByPoseDetector: false
        }
    }

    public static cleanAnnotations(item: LabelImageData): LabelImageData {
        return {
            ...item,
            labelRects: [],
            labelPoints: [],
            labelLines: [],
            labelPolygons: [],
            labelNameIds: []
        }
    }

    public static arrange(items: LabelImageData[], idArrangement: string[]): LabelImageData[] {
        return items.sort((a: LabelImageData, b: LabelImageData) => {
            return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id)
        })
    }

    public static loadMissingImages(images: LabelImageData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const missingImages = images.filter((i: LabelImageData) => !i.loadStatus);
            const missingImagesFiles = missingImages.map((i: LabelImageData) => i.fileData);
            FileUtil.loadImages(missingImagesFiles)
                .then((htmlImageElements:HTMLImageElement[]) => {
                    ImageRepository.storeImages(missingImages.map((i: LabelImageData) => i.id), htmlImageElements);
                    resolve()
                })
                .catch((error: Error) => reject(error));
        });
    }
}
