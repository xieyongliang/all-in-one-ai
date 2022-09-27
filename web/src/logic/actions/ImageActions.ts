import { LabelsSelector } from "../../store/selectors/LabelsSelector";
import { store } from "../../index";
import {
  updateActiveLabelImageIndex,
  updateActiveLabelId,
  updateActiveLabelNameId,
  updateLabelImageDataById,
} from "../../store/labels/actionCreators";
import {
  updateActiveTextImageIndex
} from "../../store/texts/actionCreators";
import {
  updateActiveRankImageIndex
} from "../../store/ranks/actionCreators";
import { ViewPortActions } from "./ViewPortActions";
import { EditorModel } from "../../staticModels/EditorModel";
import { LabelType } from "../../data/enums/LabelType";
import {
  LabelImageData,
  LabelLine,
  LabelPoint,
  LabelPolygon,
  LabelRect,
} from "../../store/labels/types";
import { LabelStatus } from "../../data/enums/LabelStatus";
import { remove } from "lodash";
import { ProjectType } from "../../data/enums/ProjectType";
import { TextsSelector } from "../../store/selectors/TextsSelector";
import { RanksSelector } from "../../store/selectors/RanksSelector";

export class ImageActions {
  public static getPreviousImage(): void {
    if(store.getState().general.projectData.type === ProjectType.IMAGE_RANK) {
      const currentImageIndex: number = RanksSelector.getActiveImageIndex();
      ImageActions.getImageByIndex(currentImageIndex - 1);
    }
    else if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION) {
      const currentImageIndex: number = TextsSelector.getActiveImageIndex();
      ImageActions.getImageByIndex(currentImageIndex - 1);
    }
    else {
      const currentImageIndex: number = LabelsSelector.getActiveImageIndex();
      ImageActions.getImageByIndex(currentImageIndex - 1);
    }
  }

  public static getNextImage(): void {
    if(store.getState().general.projectData.type === ProjectType.IMAGE_RANK) {
      const currentImageIndex: number = RanksSelector.getActiveImageIndex();
      ImageActions.getImageByIndex(currentImageIndex + 1);
    }
    else if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION) {
      const currentImageIndex: number = TextsSelector.getActiveImageIndex();
      ImageActions.getImageByIndex(currentImageIndex + 1);
    }
    else {
      const currentImageIndex: number = LabelsSelector.getActiveImageIndex();
      ImageActions.getImageByIndex(currentImageIndex + 1);
    }
  }

  public static getImageByIndex(index: number): void {
    if (EditorModel.viewPortActionsDisabled) return;

    if(store.getState().general.projectData.type === ProjectType.IMAGE_RANK) {
      const imageCount: number = RanksSelector.getImagesData().length;

      if (index < 0 || index > imageCount - 1) {
        return;
      } else {
        store.dispatch(updateActiveRankImageIndex(index));
      }
    }
    else if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION) {
      const imageCount: number = TextsSelector.getImagesData().length;

      if (index < 0 || index > imageCount - 1) {
        return;
      } else {
        store.dispatch(updateActiveTextImageIndex(index));
      }
    }
    else {
      const imageCount: number = LabelsSelector.getImagesData().length;

      if (index < 0 || index > imageCount - 1) {
        return;
      } else {
        ViewPortActions.setZoom(1);
        store.dispatch(updateActiveLabelImageIndex(index));
        store.dispatch(updateActiveLabelId(null));
      }
    }
  }

  public static setActiveLabelOnActiveImage(labelIndex: number): void {
    const labelNames = LabelsSelector.getLabelNames();
    if (labelNames.length < labelIndex + 1) {
      return;
    }

    const imageData: LabelImageData = LabelsSelector.getActiveImageData();
    store.dispatch(
      updateLabelImageDataById(
        imageData.id,
        ImageActions.mapNewLabelImageData(imageData, labelIndex)
      )
    );
    store.dispatch(updateActiveLabelNameId(labelNames[1].id));
  }

  private static mapNewLabelImageData(
    imageData: LabelImageData,
    labelIndex: number
  ): LabelImageData {
    const labelType: LabelType = LabelsSelector.getActiveLabelType();
    const labelNames = LabelsSelector.getLabelNames();
    let newImageData: LabelImageData = {
      ...imageData,
    };
    switch (labelType) {
      case LabelType.POINT:
        const point = LabelsSelector.getActivePointLabel();
        newImageData.labelPoints = imageData.labelPoints.map(
          (labelPoint: LabelPoint) => {
            if (labelPoint.id === point.id) {
              return {
                ...labelPoint,
                labelId: labelNames[labelIndex].id,
                status: LabelStatus.ACCEPTED,
              };
            }
            return labelPoint;
          }
        );
        store.dispatch(updateActiveLabelId(point.id));
        break;
      case LabelType.LINE:
        const line = LabelsSelector.getActiveLineLabel();
        newImageData.labelLines = imageData.labelLines.map(
          (labelLine: LabelLine) => {
            if (labelLine.id === line.id) {
              return {
                ...labelLine,
                labelId: labelNames[labelIndex].id,
                status: LabelStatus.ACCEPTED,
              };
            }
            return labelLine;
          }
        );
        store.dispatch(updateActiveLabelId(line.id));
        break;
      case LabelType.RECT:
        const rect = LabelsSelector.getActiveRectLabel();
        newImageData.labelRects = imageData.labelRects.map(
          (labelRectangle: LabelRect) => {
            if (labelRectangle.id === rect.id) {
              return {
                ...labelRectangle,
                labelId: labelNames[labelIndex].id,
                status: LabelStatus.ACCEPTED,
              };
            }
            return labelRectangle;
          }
        );
        store.dispatch(updateActiveLabelId(rect.id));
        break;
      case LabelType.POLYGON:
        const polygon = LabelsSelector.getActivePolygonLabel();
        newImageData.labelPolygons = imageData.labelPolygons.map(
          (labelPolygon: LabelPolygon) => {
            if (labelPolygon.id === polygon.id) {
              return {
                ...labelPolygon,
                labelId: labelNames[labelIndex].id,
                status: LabelStatus.ACCEPTED,
              };
            }
            return labelPolygon;
          }
        );
        store.dispatch(updateActiveLabelId(polygon.id));
        break;
      case LabelType.IMAGE_RECOGNITION:
        const labelId: string = labelNames[labelIndex].id;
        if (imageData.labelNameIds.includes(labelId)) {
          newImageData.labelNameIds = remove(
            imageData.labelNameIds,
            (element: string) => element !== labelId
          );
        } else {
          newImageData.labelNameIds = imageData.labelNameIds.concat(labelId);
        }
        break;
    }

    return newImageData;
  }
}