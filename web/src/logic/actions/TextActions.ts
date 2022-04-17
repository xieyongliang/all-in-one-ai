import { LabelsSelector } from '../../store/selectors/LabelsSelector';
import { TextImageData, TextPolygon, TextRect } from '../../store/texts/types';
import { filter } from 'lodash';
import { store } from '../../index';
import { TextsSelector } from '../../store/selectors/TextsSelector';
import { updateTextImageData, updateTextImageDataById } from '../../store/texts/actionCreators';

export class TextActions {
    public static deleteActiveText() {
        const activeImageData: TextImageData = TextsSelector.getActiveImageData();
        const activeLabelId: string = LabelsSelector.getActiveLabelId();
        TextActions.deleteRectTextById(activeImageData.id, activeLabelId);
    }

    public static deleteRectTextById(imageId: string, textId: string) {
        const imageData: TextImageData = TextsSelector.getImageDataById(imageId);
        const newImageLabelData = {
            ...imageData,
            textRects: filter(imageData.textRects, (currentLabel: TextRect) => {
                return currentLabel.id !== textId;
            })
        };
        store.dispatch(updateTextImageDataById(imageData.id, newImageLabelData));
    }

    public static deletePolygonTextById(imageId: string, labelPolygonId: string) {
        const imageData: TextImageData = TextsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelPolygons: filter(imageData.textPolygons, (currentLabel: TextPolygon) => {
                return currentLabel.id !== labelPolygonId;
            })
        };
        store.dispatch(updateTextImageDataById(imageData.id, newImageData));
    }

    public static removeText(textIds: string[]) {
        const imagesData: TextImageData[] = TextsSelector.getImagesData();
        const newImagesData: TextImageData[] = imagesData.map((imageData: TextImageData) => {
            return TextActions.removeLabelNamesFromImageLabelData(imageData, textIds);
        });
        store.dispatch(updateTextImageData(newImagesData))
    }

    private static removeLabelNamesFromImageLabelData(imageData: TextImageData, textIds: string[]): TextImageData {
        return {
            ...imageData,
            textRects: imageData.textRects.map((textRect: TextRect) => {
                if (textIds.includes(textRect.id)) {
                    return {
                        ...textRect,
                        id: null
                    }
                } else {
                    return textRect
                }
            })
        }
    }
}
