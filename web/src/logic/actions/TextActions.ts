import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {ImageTextData, TextRect} from '../../store/texts/types';
import {filter} from 'lodash';
import {store} from '../../index';
import { TextsSelector } from '../../store/selectors/TextsSelector';
import { updateImageTextData, updateImageTextDataById } from '../../store/texts/actionCreators';

export class TextActions {
    public static deleteActiveLabel() {
        const activeImageData: ImageTextData = TextsSelector.getActiveImageData();
        const activeLabelId: string = LabelsSelector.getActiveLabelId();
        TextActions.deleteImageTextById(activeImageData.id, activeLabelId);
    }

    public static deleteImageTextById(imageId: string, textId: string) {
        const imageData: ImageTextData = TextsSelector.getImageDataById(imageId);
        const newImageLabelData = {
            ...imageData,
            textRects: filter(imageData.textRects, (currentLabel: TextRect) => {
                return currentLabel.id !== textId;
            })
        };
        store.dispatch(updateImageTextDataById(imageData.id, newImageLabelData));
    }

    public static removeText(textIds: string[]) {
        const imagesData: ImageTextData[] = TextsSelector.getImagesData();
        const newImagesData: ImageTextData[] = imagesData.map((imageData: ImageTextData) => {
            return TextActions.removeLabelNamesFromImageLabelData(imageData, textIds);
        });
        store.dispatch(updateImageTextData(newImagesData))
    }

    private static removeLabelNamesFromImageLabelData(imageData: ImageTextData, textIds: string[]): ImageTextData {
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
