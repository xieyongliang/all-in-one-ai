import { AnnotationImporter } from '../AnnotationImporter';
import { LabelImageData, LabelName } from '../../../store/labels/types';
import { FileUtil } from '../../../utils/FileUtil';
import { ArrayUtil } from '../../../utils/ArrayUtil';
import { NoLabelNamesFileProvidedError } from './YOLOErrors';
import { LabelsSelector } from '../../../store/selectors/LabelsSelector';
import { YOLOUtils } from './YOLOUtils';
import { LabelImageDataUtil } from '../../../utils/LabelImageDataUtil';
import { zip, find } from 'lodash';
import { ImageRepository } from '../../imageRepository/ImageRepository';

export type YOLOFilesSpec = {
    labelNameFile: File
    annotationFiles: File[]
}

export class YOLOImporter extends AnnotationImporter {
    private static labelsFileName: string = 'labels.txt'

    public import(
        filesData: File[],
        onSuccess: (imagesData: LabelImageData[], labelNames: LabelName[]) => any,
        onFailure: (error?:Error) => any
    ): void {
        try {
            const sourceImagesData = LabelsSelector.getImagesData()
                .map((i: LabelImageData) => LabelImageDataUtil.cleanAnnotations(i));
            const {labelNameFile, annotationFiles} = YOLOImporter.filterFilesData(filesData, sourceImagesData);
            const [relevantImageData, relevantAnnotations] = YOLOImporter
                .matchImagesWithAnnotations(sourceImagesData, annotationFiles);
            const labelNamesPromise: Promise<LabelName[]> = FileUtil.readFile(labelNameFile)
                .then((fileContent: string) => YOLOUtils.parseLabelsNamesFromString(fileContent));
            const missingImagesPromise: Promise<void> = LabelImageDataUtil.loadMissingImages(relevantImageData);
            const annotationFilesPromise: Promise<string[]> = FileUtil.readFiles(relevantAnnotations);
            Promise
                .all([labelNamesPromise, missingImagesPromise, annotationFilesPromise])
                .then((values: [LabelName[], void, string[]]) => {
                    const [labelNames, , annotationsRaw] = values;
                    const resultImageData = zip<LabelImageData, string>(relevantImageData, annotationsRaw)
                        .map((pair: [LabelImageData, string]) => YOLOImporter.applyAnnotations(pair[0], pair[1], labelNames))
                    onSuccess(YOLOImporter.injectImageDataWithAnnotations(sourceImagesData, resultImageData), labelNames);
                })
                .catch((error: Error) => onFailure(error))
        } catch (error) {
            onFailure(error as Error)
        }
    };

    public static filterFilesData(filesData: File[], imagesData: LabelImageData[]): YOLOFilesSpec {
        const functionalityPartitionResult = ArrayUtil.partition(
            filesData,
            (i: File) => i.name === YOLOImporter.labelsFileName
        )
        if (functionalityPartitionResult.pass.length !== 1) {
            throw new NoLabelNamesFileProvidedError()
        }
        const imageIdentifiers: string[] = imagesData
            .map((i: LabelImageData) => i.fileData.name)
            .map((i: string) => FileUtil.extractFileName(i))
        const matchingPartitionResult = ArrayUtil.partition(
            filesData,
            (i: File) => imageIdentifiers.includes(FileUtil.extractFileName(i.name))
        )
        return {
            labelNameFile: functionalityPartitionResult.pass[0],
            annotationFiles: matchingPartitionResult.pass
        }
    }

    public static matchImagesWithAnnotations(images: LabelImageData[], annotations: File[]): [LabelImageData[], File[]] {
        const predicate = (image: LabelImageData, annotation:  File) => {
            return FileUtil.extractFileName(image.fileData.name) === FileUtil.extractFileName(annotation.name)
        }
        return ArrayUtil.unzip(
            ArrayUtil.match<LabelImageData, File>(images, annotations, predicate)
        );
    }

    public static applyAnnotations(imageData: LabelImageData, rawAnnotations: string, labelNames: LabelName[]): LabelImageData {
        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        imageData.labelRects = YOLOUtils.parseYOLOAnnotationsFromString(
            rawAnnotations,
            labelNames,
            {width: image.width, height: image.height},
            imageData.fileData.name
        );
        return imageData;
    }

    public static injectImageDataWithAnnotations(sourceImageData: LabelImageData[], annotatedImageData: LabelImageData[]): LabelImageData[] {
        return sourceImageData.map((i: LabelImageData) => {
            const result = find(annotatedImageData, {id: i.id});
            return !!result ? result : i;
        })
    }
}
