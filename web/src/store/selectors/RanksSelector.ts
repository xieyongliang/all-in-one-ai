import { store } from '../..';
import { RankImageData } from '../ranks/types';
import { find } from 'lodash';

export class RanksSelector {
    public static getImagesData(): RankImageData[] {
        return store.getState().ranks.imagesData;
    }

    public static getActiveImageIndex(): number {
        return store.getState().ranks.activeImageIndex;
    }

    public static getActiveImageData(): RankImageData | null {
        const activeImageIndex: number | null = RanksSelector.getActiveImageIndex();

        if (activeImageIndex === null)
            return null;

        return RanksSelector.getImageDataByIndex(activeImageIndex);
    }

    public static getImageDataByIndex(index: number): RankImageData {
        const imagesData: RankImageData[] = RanksSelector.getImagesData();
        return imagesData[index];
    }

    public static getImageDataById(id: string): RankImageData {
        const imagesData: RankImageData[] = RanksSelector.getImagesData();
        return find(imagesData, {id});
    }
}
