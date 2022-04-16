import { LabelsSelector } from '../../store/selectors/LabelsSelector';
import { LabelImageData, LabelLine, LabelName, LabelPoint, LabelPolygon, LabelRect} from '../../store/labels/types';
import { filter } from 'lodash';
import { store } from '../../index';
import { updateLabelImageData, updateLabelImageDataById} from '../../store/labels/actionCreators';
import { LabelType } from '../../data/enums/LabelType';

export class LabelActions {
    public static deleteActiveLabel() {
        const activeImageData: LabelImageData = LabelsSelector.getActiveImageData();
        const activeLabelId: string = LabelsSelector.getActiveLabelId();
        LabelActions.deleteImageLabelById(activeImageData.id, activeLabelId);
    }

    public static deleteImageLabelById(imageId: string, labelId: string) {
        switch (LabelsSelector.getActiveLabelType()) {
            case LabelType.POINT:
                LabelActions.deletePointLabelById(imageId, labelId);
                break;
            case LabelType.RECT:
                LabelActions.deleteRectLabelById(imageId, labelId);
                break;
            case LabelType.POLYGON:
                LabelActions.deletePolygonLabelById(imageId, labelId);
                break;
        }
    }

    public static deleteRectLabelById(imageId: string, labelRectId: string) {
        const imageData: LabelImageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelRects: filter(imageData.labelRects, (currentLabel: LabelRect) => {
                return currentLabel.id !== labelRectId;
            })
        };
        store.dispatch(updateLabelImageDataById(imageData.id, newImageData));
    }

    public static deletePointLabelById(imageId: string, labelPointId: string) {
        const imageData: LabelImageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelPoints: filter(imageData.labelPoints, (currentLabel: LabelPoint) => {
                return currentLabel.id !== labelPointId;
            })
        };
        store.dispatch(updateLabelImageDataById(imageData.id, newImageData));
    }

    public static deleteLineLabelById(imageId: string, labelLineId: string) {
        const imageData: LabelImageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelLines: filter(imageData.labelLines, (currentLabel: LabelLine) => {
                return currentLabel.id !== labelLineId;
            })
        };
        store.dispatch(updateLabelImageDataById(imageData.id, newImageData));
    }

    public static deletePolygonLabelById(imageId: string, labelPolygonId: string) {
        const imageData: LabelImageData = LabelsSelector.getImageDataById(imageId);
        const newImageData = {
            ...imageData,
            labelPolygons: filter(imageData.labelPolygons, (currentLabel: LabelPolygon) => {
                return currentLabel.id !== labelPolygonId;
            })
        };
        store.dispatch(updateLabelImageDataById(imageData.id, newImageData));
    }

    public static removeLabelNames(labelNamesIds: string[]) {
        const imagesData: LabelImageData[] = LabelsSelector.getImagesData();
        const newImagesData: LabelImageData[] = imagesData.map((imageData: LabelImageData) => {
            return LabelActions.removeLabelNamesFromLabelImageData(imageData, labelNamesIds);
        });
        store.dispatch(updateLabelImageData(newImagesData))
    }

    private static removeLabelNamesFromLabelImageData(imageData: LabelImageData, labelNamesIds: string[]): LabelImageData {
        return {
            ...imageData,
            labelRects: imageData.labelRects.map((labelRect: LabelRect) => {
                if (labelNamesIds.includes(labelRect.id)) {
                    return {
                        ...labelRect,
                        id: null
                    }
                } else {
                    return labelRect
                }
            }),
            labelPoints: imageData.labelPoints.map((labelPoint: LabelPoint) => {
                if (labelNamesIds.includes(labelPoint.id)) {
                    return {
                        ...labelPoint,
                        id: null
                    }
                } else {
                    return labelPoint
                }
            }),
            labelPolygons: imageData.labelPolygons.map((labelPolygon: LabelPolygon) => {
                if (labelNamesIds.includes(labelPolygon.id)) {
                    return {
                        ...labelPolygon,
                        id: null
                    }
                } else {
                    return labelPolygon
                }
            }),
            labelNameIds: imageData.labelNameIds.filter((labelNameId: string) => {
                return !labelNamesIds.includes(labelNameId)
            })
        }
    }

    public static labelExistsInLabelNames(label: string): boolean {
        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        return labelNames
            .map((labelName: LabelName) => labelName.name)
            .includes(label)
    }
}
