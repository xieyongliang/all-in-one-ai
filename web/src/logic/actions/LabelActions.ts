import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {ImageLabelData, LabelLine, LabelName, LabelPoint, LabelPolygon, LabelRect} from '../../store/labels/types';
import {filter} from 'lodash';
import {store} from '../../index';
import {updateImageLabelData, updateImageLabelDataById} from '../../store/labels/actionCreators';
import {LabelType} from '../../data/enums/LabelType';

export class LabelActions {
    public static deleteActiveLabel() {
        const activeImageLabelData: ImageLabelData = LabelsSelector.getActiveImageLabelData();
        const activeLabelId: string = LabelsSelector.getActiveLabelId();
        LabelActions.deleteImageLabelById(activeImageLabelData.id, activeLabelId);
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
        const imageData: ImageLabelData = LabelsSelector.getImageLabelDataById(imageId);
        const newImageLabelData = {
            ...imageData,
            labelRects: filter(imageData.labelRects, (currentLabel: LabelRect) => {
                return currentLabel.id !== labelRectId;
            })
        };
        store.dispatch(updateImageLabelDataById(imageData.id, newImageLabelData));
    }

    public static deletePointLabelById(imageId: string, labelPointId: string) {
        const imageData: ImageLabelData = LabelsSelector.getImageLabelDataById(imageId);
        const newImageLabelData = {
            ...imageData,
            labelPoints: filter(imageData.labelPoints, (currentLabel: LabelPoint) => {
                return currentLabel.id !== labelPointId;
            })
        };
        store.dispatch(updateImageLabelDataById(imageData.id, newImageLabelData));
    }

    public static deleteLineLabelById(imageId: string, labelLineId: string) {
        const imageData: ImageLabelData = LabelsSelector.getImageLabelDataById(imageId);
        const newImageLabelData = {
            ...imageData,
            labelLines: filter(imageData.labelLines, (currentLabel: LabelLine) => {
                return currentLabel.id !== labelLineId;
            })
        };
        store.dispatch(updateImageLabelDataById(imageData.id, newImageLabelData));
    }

    public static deletePolygonLabelById(imageId: string, labelPolygonId: string) {
        const imageData: ImageLabelData = LabelsSelector.getImageLabelDataById(imageId);
        const newImageLabelData = {
            ...imageData,
            labelPolygons: filter(imageData.labelPolygons, (currentLabel: LabelPolygon) => {
                return currentLabel.id !== labelPolygonId;
            })
        };
        store.dispatch(updateImageLabelDataById(imageData.id, newImageLabelData));
    }

    public static removeLabelNames(labelNamesIds: string[]) {
        const imagesData: ImageLabelData[] = LabelsSelector.getImagesData();
        const newImagesData: ImageLabelData[] = imagesData.map((imageData: ImageLabelData) => {
            return LabelActions.removeLabelNamesFromImageLabelData(imageData, labelNamesIds);
        });
        store.dispatch(updateImageLabelData(newImagesData))
    }

    private static removeLabelNamesFromImageLabelData(imageData: ImageLabelData, labelNamesIds: string[]): ImageLabelData {
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
