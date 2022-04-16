import {LabelImageData, LabelName} from '../../../store/labels/types';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import {COCOCategory, COCOImage, COCOObject} from '../../../data/labels/COCO';
import { v4 as uuidv4 } from 'uuid';
import {ArrayUtil, PartitionResult} from '../../../utils/ArrayUtil';
import {LabelImageDataUtil} from '../../../utils/LabelImageDataUtil';
import {LabelUtil} from '../../../utils/LabelUtil';
import {
    COCOAnnotationDeserializationError,
    COCOAnnotationFileCountError,
    COCOAnnotationReadingError,
    COCOFormatValidationError
} from './COCOErrors';
import {LabelType} from '../../../data/enums/LabelType';
import {AnnotationImporter, ImportResult} from '../AnnotationImporter';
import {COCOUtils} from './COCOUtils';
import {Settings} from "../../../settings/Settings";

export type FileNameCOCOIdMap = {[ fileName: string]: number; }
export type LabelNameMap = { [labelCOCOId: number]: LabelName; }
export type LabelImageDataMap = { [imageCOCOId: number]: LabelImageData; }

export class COCOImporter extends AnnotationImporter {
    public static requiredKeys = ['images', 'annotations', 'categories']

    public import(
        filesData: File[],
        onSuccess: (imagesData: LabelImageData[], labelNames: LabelName[]) => any,
        onFailure: (error?:Error) => any
    ): void {
        if (filesData.length > 1) {
            onFailure(new COCOAnnotationFileCountError());
        }

        const reader = new FileReader();
        reader.readAsText(filesData[0]);
        reader.onloadend = (evt: any) => {
            try {
                const inputImagesLabelData: LabelImageData[] = LabelsSelector.getImagesData();
                const annotations = COCOImporter.deserialize(evt.target.result)
                const {imagesData, labelNames} = this.applyLabels(inputImagesLabelData, annotations);
                onSuccess(imagesData,labelNames);
            } catch (error) {
                onFailure(error as Error);
            }
        };
        reader.onerror = () => onFailure(new COCOAnnotationReadingError());
    }

    public static deserialize(text: string): COCOObject {
        try {
            return JSON.parse(text) as COCOObject
        } catch (error) {
            throw new COCOAnnotationDeserializationError()
        }
    }

    public applyLabels(imageData: LabelImageData[], annotationsObject: COCOObject): ImportResult {
        COCOImporter.validateCocoFormat(annotationsObject);
        const {images, categories, annotations} = annotationsObject;
        const labelNameMap: LabelNameMap = COCOImporter.mapCOCOCategories(categories);
        const cleanLabelImageData: LabelImageData[] = imageData.map((item: LabelImageData) => LabelImageDataUtil.cleanAnnotations(item));
        const imageDataPartition: PartitionResult<LabelImageData> = COCOImporter.partitionLabelImageData(cleanLabelImageData, images);
        const imageDataMap: LabelImageDataMap = COCOImporter.mapLabelImageData(imageDataPartition.pass, images);

        for (const annotation of annotations) {
            if (!imageDataMap[annotation.image_id] || annotation.iscrowd === 1)
                continue

            if (this.labelType.includes(LabelType.RECT)) {
                imageDataMap[annotation.image_id].labelRects.push(LabelUtil.createLabelRect(
                    labelNameMap[annotation.category_id].id,
                    COCOUtils.bbox2rect(annotation.bbox)
                ))
            }

            if (this.labelType.includes(LabelType.POLYGON)) {
                const polygons = COCOUtils.segmentation2vertices(annotation.segmentation);
                for (const polygon of polygons) {
                    imageDataMap[annotation.image_id].labelPolygons.push(LabelUtil.createLabelPolygon(
                        labelNameMap[annotation.category_id].id, polygon
                    ))
                }
            }
        }

        const resultLabelImageData = Object.values(imageDataMap).concat(imageDataPartition.fail);

        return {
            imagesData: LabelImageDataUtil.arrange(resultLabelImageData, imageData.map((item: LabelImageData) => item.id)),
            labelNames: Object.values(labelNameMap)
        }
    }

    protected static partitionLabelImageData(items: LabelImageData[], images: COCOImage[]): PartitionResult<LabelImageData> {
        const imageNames: string[] = images.map((item: COCOImage) => item.file_name);
        const predicate = (item: LabelImageData) => imageNames.includes(item.fileData.name);
        return ArrayUtil.partition<LabelImageData>(items, predicate);
    }

    protected static mapCOCOCategories(categories: COCOCategory[]): LabelNameMap {
        return categories.reduce((acc: LabelNameMap, category : COCOCategory, index: number) => {
            acc[category.id] = {
                id: uuidv4(),
                name: category.name,
                color: ArrayUtil.getByInfiniteIndex(Settings.LABEL_COLORS_PALETTE, index)
            }
            return acc
        }, {});
    }

    protected static mapLabelImageData(items: LabelImageData[], images: COCOImage[]): LabelImageDataMap {
        const fileNameCOCOIdMap: FileNameCOCOIdMap = images.reduce((acc: FileNameCOCOIdMap, image: COCOImage) => {
            acc[image.file_name] = image.id
            return acc
        }, {});
        return  items.reduce((acc: LabelImageDataMap, image: LabelImageData) => {
            acc[fileNameCOCOIdMap[image.fileData.name]] = image
            return acc;
        }, {});
    }

    public static validateCocoFormat(annotationsObject: COCOObject): void {
        const missingKeys = COCOImporter.requiredKeys.filter((key: string) => !annotationsObject.hasOwnProperty(key))
        if (missingKeys.length !== 0) {
            throw new COCOFormatValidationError(`Uploaded file does not contain all required keys: ${missingKeys}`)
        }
    }
}
