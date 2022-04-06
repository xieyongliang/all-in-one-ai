import {store} from '../..';
import {ImageLabelData, LabelLine, LabelName, LabelPoint, LabelPolygon, LabelRect} from '../labels/types';
import {find} from 'lodash';
import {LabelType} from '../../data/enums/LabelType';

export class LabelsSelector {
    public static getLabelNames(): LabelName[] {
        return store.getState().labels.labels;
    }

    public static getLabelNameById(id: string): LabelName | undefined {
        const labelName: LabelName[] = LabelsSelector.getLabelNames()
        return find(labelName, {id});
    }

    public static getActiveLabelNameId(): string {
        return store.getState().labels.activeLabelNameId;
    }

    public static getActiveLabelType(): LabelType {
        return store.getState().labels.activeLabelType;
    }

    public static getImagesData(): ImageLabelData[] {
        return store.getState().labels.imagesData;
    }

    public static getActiveImageIndex(): number {
        return store.getState().labels.activeImageIndex;
    }

    public static getActiveImageLabelData(): ImageLabelData | null {
        const activeImageIndex: number | null = LabelsSelector.getActiveImageIndex();

        if (activeImageIndex === null)
            return null;

        return LabelsSelector.getImageLabelDataByIndex(activeImageIndex);
    }

    public static getImageLabelDataByIndex(index: number): ImageLabelData {
        const imagesData: ImageLabelData[] = LabelsSelector.getImagesData();
        return imagesData[index];
    }

    public static getImageLabelDataById(id: string): ImageLabelData {
        const imagesData: ImageLabelData[] = LabelsSelector.getImagesData();
        return find(imagesData, {id});
    }

    public static getActiveLabelId(): string | null {
        return store.getState().labels.activeLabelId;
    }

    public static getHighlightedLabelId(): string | null {
        return store.getState().labels.highlightedLabelId;
    }

    public static getActiveRectLabel(): LabelRect | null {
        const activeLabelId: string | null = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageLabelData().labelRects, {id: activeLabelId});
    }

    public static getActivePointLabel(): LabelPoint | null {
        const activeLabelId: string | null = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageLabelData().labelPoints, {id: activeLabelId});
    }

    public static getActivePolygonLabel(): LabelPolygon | null {
        const activeLabelId: string | null = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageLabelData().labelPolygons, {id: activeLabelId});
    }

    public static getActiveLineLabel(): LabelLine | null {
        const activeLabelId: string | null = LabelsSelector.getActiveLabelId();

        if (activeLabelId === null)
            return null;

        return find(LabelsSelector.getActiveImageLabelData().labelLines, {id: activeLabelId});
    }
}
