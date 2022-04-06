import {AnnotationImporter} from '../AnnotationImporter';
import {ImageLabelData, LabelName} from '../../../store/labels/types';
import {FileUtil} from '../../../utils/FileUtil';
import {ArrayUtil} from '../../../utils/ArrayUtil';
import {NoLabelNamesFileProvidedError} from './YOLOErrors';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import {YOLOUtils} from './YOLOUtils';
import {ImageLabelDataUtil} from '../../../utils/ImageLabelDataUtil';
import {zip, find} from 'lodash';
import {ImageRepository} from '../../imageRepository/ImageRepository';

export type YOLOFilesSpec = {
    labelNameFile: File
    annotationFiles: File[]
}

export class YOLOImporter extends AnnotationImporter {
    private static labelsFileName: string = 'labels.txt'

    public import(
        filesData: File[],
        onSuccess: (imagesData: ImageLabelData[], labelNames: LabelName[]) => any,
        onFailure: (error?:Error) => any
    ): void {
        try {
            const sourceImagesData = LabelsSelector.getImagesData()
                .map((i: ImageLabelData) => ImageLabelDataUtil.cleanAnnotations(i));
            const {labelNameFile, annotationFiles} = YOLOImporter.filterFilesData(filesData, sourceImagesData);
            const [relevantImageData, relevantAnnotations] = YOLOImporter
                .matchImagesWithAnnotations(sourceImagesData, annotationFiles);
            const labelNamesPromise: Promise<LabelName[]> = FileUtil.readFile(labelNameFile)
                .then((fileContent: string) => YOLOUtils.parseLabelsNamesFromString(fileContent));
            const missingImagesPromise: Promise<void> = ImageLabelDataUtil.loadMissingImages(relevantImageData);
            const annotationFilesPromise: Promise<string[]> = FileUtil.readFiles(relevantAnnotations);
            Promise
                .all([labelNamesPromise, missingImagesPromise, annotationFilesPromise])
                .then((values: [LabelName[], void, string[]]) => {
                    const [labelNames, , annotationsRaw] = values;
                    const resultImageData = zip<ImageLabelData, string>(relevantImageData, annotationsRaw)
                        .map((pair: [ImageLabelData, string]) => YOLOImporter.applyAnnotations(pair[0], pair[1], labelNames))
                    onSuccess(YOLOImporter.injectImageDataWithAnnotations(sourceImagesData, resultImageData), labelNames);
                })
                .catch((error: Error) => onFailure(error))
        } catch (error) {
            onFailure(error as Error)
        }
    };

    public static filterFilesData(filesData: File[], imagesData: ImageLabelData[]): YOLOFilesSpec {
        const functionalityPartitionResult = ArrayUtil.partition(
            filesData,
            (i: File) => i.name === YOLOImporter.labelsFileName
        )
        if (functionalityPartitionResult.pass.length !== 1) {
            throw new NoLabelNamesFileProvidedError()
        }
        const imageIdentifiers: string[] = imagesData
            .map((i: ImageLabelData) => i.fileData.name)
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

    public static matchImagesWithAnnotations(images: ImageLabelData[], annotations: File[]): [ImageLabelData[], File[]] {
        const predicate = (image: ImageLabelData, annotation:  File) => {
            return FileUtil.extractFileName(image.fileData.name) === FileUtil.extractFileName(annotation.name)
        }
        return ArrayUtil.unzip(
            ArrayUtil.match<ImageLabelData, File>(images, annotations, predicate)
        );
    }

    public static applyAnnotations(imageData: ImageLabelData, rawAnnotations: string, labelNames: LabelName[]): ImageLabelData {
        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        imageData.labelRects = YOLOUtils.parseYOLOAnnotationsFromString(
            rawAnnotations,
            labelNames,
            {width: image.width, height: image.height},
            imageData.fileData.name
        );
        return imageData;
    }

    public static injectImageDataWithAnnotations(sourceImageData: ImageLabelData[], annotatedImageData: ImageLabelData[]): ImageLabelData[] {
        return sourceImageData.map((i: ImageLabelData) => {
            const result = find(annotatedImageData, {id: i.id});
            return !!result ? result : i;
        })
    }
}
