import {DetectedObject} from '@tensorflow-models/coco-ssd';
import {ImageLabelData, LabelName, LabelRect} from '../../store/labels/types';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import { v4 as uuidv4 } from 'uuid';
import {store} from '../../index';
import {updateImageLabelDataById} from '../../store/labels/actionCreators';
import {ObjectDetector} from '../../ai/ObjectDetector';
import {ImageRepository} from '../imageRepository/ImageRepository';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {findLast} from 'lodash';
import {updateSuggestedLabelList} from '../../store/ai/actionCreators';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {updateActivePopupType} from '../../store/general/actionCreators';
import {AISelector} from '../../store/selectors/AISelector';
import {AIActions} from './AIActions';
import { ProjectType } from '../../data/enums/ProjectType';

export class AIObjectDetectionActions {
    public static detectRectsForActiveImage(): void {
        const activeImageLabelData: ImageLabelData = LabelsSelector.getActiveImageLabelData();
        AIObjectDetectionActions.detectRects(activeImageLabelData.id, ImageRepository.getById(activeImageLabelData.id))
    }

    public static detectRects(imageId: string, image: HTMLImageElement): void {
        if (store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
            return;

        if (LabelsSelector.getImageLabelDataById(imageId).isVisitedByObjectDetector || !AISelector.isAIObjectDetectorModelLoaded())
            return;

        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        ObjectDetector.predict(image, (predictions: DetectedObject[]) => {
            const suggestedLabelNames = AIObjectDetectionActions.extractNewSuggestedLabelNames(LabelsSelector.getLabelNames(), predictions);
            const rejectedLabelNames = AISelector.getRejectedSuggestedLabelList();
            const newlySuggestedNames = AIActions.excludeRejectedLabelNames(suggestedLabelNames, rejectedLabelNames);
            if (newlySuggestedNames.length > 0) {
                store.dispatch(updateSuggestedLabelList(newlySuggestedNames));
                store.dispatch(updateActivePopupType(PopupWindowType.SUGGEST_LABEL_NAMES));
            } else {
                store.dispatch(updateActivePopupType(null));
            }
            AIObjectDetectionActions.saveRectPredictions(imageId, predictions);
        })
    }

    public static saveRectPredictions(imageId: string, predictions: DetectedObject[]) {
        const imageData: ImageLabelData = LabelsSelector.getImageLabelDataById(imageId);
        const predictedLabels: LabelRect[] = AIObjectDetectionActions.mapPredictionsToRectLabels(predictions);
        const nextImageLabelData: ImageLabelData = {
            ...imageData,
            labelRects: imageData.labelRects.concat(predictedLabels),
            isVisitedByObjectDetector: true
        };
        store.dispatch(updateImageLabelDataById(imageData.id, nextImageLabelData));
    }

    private static mapPredictionsToRectLabels(predictions: DetectedObject[]): LabelRect[] {
        return predictions.map((prediction: DetectedObject) => {
            return {
                id: uuidv4(),
                labelIndex: null,
                labelId: null,
                rect: {
                    x: prediction.bbox[0],
                    y: prediction.bbox[1],
                    width: prediction.bbox[2],
                    height: prediction.bbox[3],
                },
                isCreatedByAI: true,
                status: LabelStatus.UNDECIDED,
                suggestedLabel: prediction.class
            }
        })
    }

    public static extractNewSuggestedLabelNames(labels: LabelName[], predictions: DetectedObject[]): string[] {
        return predictions.reduce((acc: string[], prediction: DetectedObject) => {
            if (!acc.includes(prediction.class) && !findLast(labels, {name: prediction.class})) {
                acc.push(prediction.class)
            }
            return acc;
        }, [])
    }

    public static acceptAllSuggestedRectLabels(imageData: ImageLabelData) {
        const newImageLabelData: ImageLabelData = {
            ...imageData,
            labelRects: imageData.labelRects.map((labelRect: LabelRect) => {
                const labelName: LabelName = findLast(LabelsSelector.getLabelNames(), {name: labelRect.suggestedLabel});
                return {
                    ...labelRect,
                    status: LabelStatus.ACCEPTED,
                    labelId: !!labelName ? labelName.id : labelRect.labelId
                }
            })
        };
        store.dispatch(updateImageLabelDataById(newImageLabelData.id, newImageLabelData));
    }

    public static rejectAllSuggestedRectLabels(imageData: ImageLabelData) {
        const newImageLabelData: ImageLabelData = {
            ...imageData,
            labelRects: imageData.labelRects.filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED)
        };
        store.dispatch(updateImageLabelDataById(newImageLabelData.id, newImageLabelData));
    }
}
