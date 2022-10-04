import { store } from '../..';
import { GenericImageData } from '../genericimages/types';
import { find } from 'lodash';

export class GenericImageSelector {
    public static getImagesData(): GenericImageData[] {
        return store.getState().genericimage.imagesData;
    }

    public static getActiveImageIndex(): number {
        return store.getState().genericimage.activeImageIndex;
    }

    public static getActiveImageData(): GenericImageData | null {
        const activeImageIndex: number | null = GenericImageSelector.getActiveImageIndex();

        if (activeImageIndex === null)
            return null;

        return GenericImageSelector.getImageDataByIndex(activeImageIndex);
    }

    public static getImageDataByIndex(index: number): GenericImageData {
        const imagesData: GenericImageData[] = GenericImageSelector.getImagesData();
        return imagesData[index];
    }

    public static getImageDataById(id: string): GenericImageData {
        const imagesData: GenericImageData[] = GenericImageSelector.getImagesData();
        return find(imagesData, {id});
    }
}
