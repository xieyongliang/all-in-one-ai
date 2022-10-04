import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {AnnotationFormatType} from "../../data/enums/AnnotationFormatType";
import { GenericImageData } from '../../store/genericimages/types';
import { GenericImageSelector } from '../../store/selectors/GenericImageSelector';
import { ExporterUtil } from '../../utils/ExporterUtil';

export class GenericImageExporter {
    public static export(exportFormatType: AnnotationFormatType): void {
        const zip = new JSZip();
        GenericImageSelector.getImagesData()
            .forEach((imageData: GenericImageData) => {
                const fileContent: string = imageData.value;
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
}

