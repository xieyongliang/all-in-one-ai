import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {AnnotationFormatType} from "../../data/enums/AnnotationFormatType";
import { RankImageData } from '../../store/ranks/types';
import { RanksSelector } from '../../store/selectors/RanksSelector';
import { ExporterUtil } from '../../utils/ExporterUtil';

export class RankExporter {
    public static export(exportFormatType: AnnotationFormatType): void {
        const zip = new JSZip();
        RanksSelector.getImagesData()
            .forEach((imageData: RankImageData) => {
                const fileContent: string = imageData.rank;
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

