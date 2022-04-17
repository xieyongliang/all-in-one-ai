import { store } from '../..';
import { TextImageData, Text, TextRect, TextPolygon} from '../texts/types';
import { find } from 'lodash';

export class TextsSelector {
    public static getTexts(): Text[] {
        return store.getState().texts.texts;
    }

    public static getTextById(id: string): Text | undefined {
        const texts: Text[] = TextsSelector.getTexts()
        return find(texts, {id});
    }

    public static getActiveTextId(): string {
        return store.getState().texts.activeTextId;
    }

    public static getHighlightedTextId(): string | null {
        return store.getState().texts.highlightedTextId;
    }

    public static getActiveRectText(): TextRect | null {
        const activeTextId: string | null = TextsSelector.getActiveTextId();

        if (activeTextId === null)
            return null;

        return find(TextsSelector.getActiveImageData().textRects, {id: activeTextId});
    }

    public static getImagesData(): TextImageData[] {
        return store.getState().texts.imagesData;
    }

    public static getActiveImageIndex(): number {
        return store.getState().texts.activeImageIndex;
    }

    public static getActiveImageData(): TextImageData | null {
        const activeImageIndex: number | null = TextsSelector.getActiveImageIndex();

        if (activeImageIndex === null)
            return null;

        return TextsSelector.getImageDataByIndex(activeImageIndex);
    }

    public static getImageDataByIndex(index: number): TextImageData {
        const imagesData: TextImageData[] = TextsSelector.getImagesData();
        return imagesData[index];
    }

    public static getImageDataById(id: string): TextImageData {
        const imagesData: TextImageData[] = TextsSelector.getImagesData();
        return find(imagesData, {id});
    }

    public static getActivePolygonText(): TextPolygon | null {
        const activeLabelId: string | null = TextsSelector.getActiveTextId();

        if (activeLabelId === null)
            return null;

        return find(TextsSelector.getActiveImageData().textPolygons, {id: activeLabelId});
    }
}
