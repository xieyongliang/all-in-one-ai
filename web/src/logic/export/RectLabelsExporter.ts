import { ExportDataFormatType, AnnotationFormatType } from '../../data/enums/AnnotationFormatType';
import { LabelImageData, LabelName, LabelRect } from '../../store/labels/types';
import { ImageRepository } from '../imageRepository/ImageRepository';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { LabelsSelector } from '../../store/selectors/LabelsSelector';
import { XMLSanitizerUtil } from '../../utils/XMLSanitizerUtil';
import { ExporterUtil } from '../../utils/ExporterUtil';
import { GeneralSelector } from '../../store/selectors/GeneralSelector';
import { findIndex, findLast } from 'lodash';
import { ISize } from '../../interfaces/ISize';
import { NumberUtil } from '../../utils/NumberUtil';
import { RectUtil } from '../../utils/RectUtil';

export class RectLabelsExporter {
    public static export(exportFormatType: AnnotationFormatType, imageBuckets?: string[], imageKeys?: string[]): void {
        switch (exportFormatType) {
            case AnnotationFormatType.YOLO:
                RectLabelsExporter.exportAsYOLO();
                break;
            case AnnotationFormatType.VOC:
                RectLabelsExporter.exportAsVOC();
                break;
            case AnnotationFormatType.CSV:
                RectLabelsExporter.exportAsCSV();
                break;
            default:
                return;
        }
    }

    public static exportData(exportDataFormatType: ExportDataFormatType, imageBuckets: string[], imageKeys: string[]): Object[] {
        switch (exportDataFormatType) {
            case ExportDataFormatType.YOLOData:
                return RectLabelsExporter.exportAsYOLOData(imageBuckets, imageKeys);
            default:
                return [{}];
        }
    }

    private static exportAsYOLO(): void {
        const zip = new JSZip();
        LabelsSelector.getImagesData()
            .forEach((imageData: LabelImageData) => {
                const fileContent: string = RectLabelsExporter.wrapRectLabelsIntoYOLO(imageData);
                if (fileContent) {
                    const fileName : string = imageData.fileData.name.replace(/\.[^/.]+$/, '.txt');
                    try {
                        zip.file(fileName, fileContent);
                    } catch (error) {
                        // TODO
                        throw new Error(error as string);
                    }
                }
            });

        try {
            zip.generateAsync({type:'blob'})
                .then((content: Blob) => {
                    saveAs(content, `${ExporterUtil.getExportFileName()}.zip`);
                });
        } catch (error) {
            // TODO
            throw new Error(error as string);
        }
    }

    private static exportAsYOLOData(imageBuckets: string[], imageKeys: string[]): Object[] {
        const outputs = []
        
        var index = 0;
        LabelsSelector.getImagesData()
            .forEach((imageData: LabelImageData) => {
                const fileContent: string = RectLabelsExporter.wrapRectLabelsIntoYOLO(imageData);
                var output = {
                    bucket: imageBuckets[index],
                    key: imageKeys[index],
                    data: fileContent
                }
                outputs.push(output);
                index++;
            });
        return outputs;
    }

    public static wrapRectLabelIntoYOLO(labelRect: LabelRect, labelNames: LabelName[], imageSize: ISize): string {
        const snapAndFix = (value: number) => NumberUtil.snapValueToRange(value,0, 1).toFixed(6)
        const classIdx: string = findIndex(labelNames, {id: labelRect.labelId}).toString()
        const rectCenter = RectUtil.getCenter(labelRect.rect)
        const rectSize = RectUtil.getSize(labelRect.rect)
        const rawBBox: number[] = [
            rectCenter.x / imageSize.width,
            rectCenter.y / imageSize.height,
            rectSize.width / imageSize.width,
            rectSize.height / imageSize.height
        ]

        let [x, y, width, height] = rawBBox.map((value: number) => parseFloat(snapAndFix(value)))

        if (x + width / 2 > 1) { width = 2 * (1 - x) }
        if (x - width / 2 < 0) { width = 2 * x }
        if (y + height / 2 > 1) { height = 2 * (1 - y) }
        if (y - height / 2 < 0) { height = 2 * y }

        const processedBBox = [x, y, width, height].map((value: number) => snapAndFix(value))

        return [classIdx, ...processedBBox].join(' ')
    }

    public static wrapRectLabelsIntoYOLO(imageData: LabelImageData): string {
        if (imageData.labelRects.length === 0 || !imageData.loadStatus)
            return null;

        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        const imageSize: ISize = {width: image.width, height: image.height}
        const labelRectsString: string[] = imageData.labelRects.map((labelRect: LabelRect) => {
            return RectLabelsExporter.wrapRectLabelIntoYOLO(labelRect, labelNames, imageSize)
        });
        return labelRectsString.join('\n');
    }

    private static exportAsVOC(): void {
        const zip = new JSZip();
        LabelsSelector.getImagesData().forEach((imageData: LabelImageData) => {
                const fileContent: string = RectLabelsExporter.wrapImageIntoVOC(imageData);
                if (fileContent) {
                    const fileName : string = imageData.fileData.name.replace(/\.[^/.]+$/, '.xml');
                    try {
                        zip.file(fileName, fileContent);
                    } catch (error) {
                        // TODO
                        throw new Error(error as string);
                    }
                }
            });

        try {
            zip.generateAsync({type:'blob'})
                .then(function(content) {
                    saveAs(content, `${ExporterUtil.getExportFileName()}.zip`);
                });
        } catch (error) {
            // TODO
            throw new Error(error as string);
        }
    }

    private static wrapRectLabelsIntoVOC(imageData: LabelImageData): string {
        if (imageData.labelRects.length === 0 || !imageData.loadStatus)
            return null;

        const labelNamesList: LabelName[] = LabelsSelector.getLabelNames();
        const labelRectsString: string[] = imageData.labelRects.map((labelRect: LabelRect) => {
            const labelName: LabelName = findLast(labelNamesList, {id: labelRect.labelId});
            const labelFields = !!labelName ? [
                `\t<object>`,
                `\t\t<name>${labelName.name}</name>`,
                `\t\t<pose>Unspecified</pose>`,
                `\t\t<truncated>0</truncated>`,
                `\t\t<difficult>0</difficult>`,
                `\t\t<bndbox>`,
                `\t\t\t<xmin>${Math.round(labelRect.rect.x)}</xmin>`,
                `\t\t\t<ymin>${Math.round(labelRect.rect.y)}</ymin>`,
                `\t\t\t<xmax>${Math.round(labelRect.rect.x + labelRect.rect.width)}</xmax>`,
                `\t\t\t<ymax>${Math.round(labelRect.rect.y + labelRect.rect.height)}</ymax>`,
                `\t\t</bndbox>`,
                `\t</object>`
            ] : [];
            return labelFields.join('\n')
        });
        return labelRectsString.join('\n');
    }

    private static wrapImageIntoVOC(imageData: LabelImageData): string {
        const labels: string = RectLabelsExporter.wrapRectLabelsIntoVOC(imageData);
        const projectName: string = XMLSanitizerUtil.sanitize(GeneralSelector.getProjectName());

        if (labels) {
            const image: HTMLImageElement = ImageRepository.getById(imageData.id);
            return [
                `<annotation>`,
                `\t<folder>${projectName}</folder>`,
                `\t<filename>${imageData.fileData.name}</filename>`,
                `\t<path>/${projectName}/${imageData.fileData.name}</path>`,
                `\t<source>`,
                `\t\t<database>Unspecified</database>`,
                `\t</source>`,
                `\t<size>`,
                `\t\t<width>${image.width}</width>`,
                `\t\t<height>${image.height}</height>`,
                `\t\t<depth>3</depth>`,
                `\t</size>`,
                labels,
                `</annotation>`
            ].join('\n');
        }
        return null;
    }


    private static exportAsCSV(): void {
        const content: string = LabelsSelector.getImagesData()
            .map((imageData: LabelImageData) => {
                return RectLabelsExporter.wrapRectLabelsIntoCSV(imageData)})
            .filter((imageData: string) => {
                return !!imageData})
            .join('\n');
        const fileName: string = `${ExporterUtil.getExportFileName()}.csv`;
        ExporterUtil.saveAs(content, fileName);
    }

    private static wrapRectLabelsIntoCSV(imageData: LabelImageData): string {
        if (imageData.labelRects.length === 0 || !imageData.loadStatus)
            return null;

        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const labelRectsString: string[] = imageData.labelRects.map((labelRect: LabelRect) => {
            const labelName: LabelName = findLast(labelNames, {id: labelRect.labelId});
            const labelFields = !!labelName ? [
                labelName.name,
                Math.round(labelRect.rect.x).toString(),
                Math.round(labelRect.rect.y).toString(),
                Math.round(labelRect.rect.width).toString(),
                Math.round(labelRect.rect.height).toString(),
                imageData.fileData.name,
                image.width.toString(),
                image.height.toString()
            ] : [];
            return labelFields.join(',')
        });
        return labelRectsString.join('\n');
    }
}
