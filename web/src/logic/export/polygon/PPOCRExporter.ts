import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TextsSelector } from "../../../store/selectors/TextsSelector";
import { ExporterUtil } from "../../../utils/ExporterUtil";
import { TextPolygon, TextImageData } from "../../../store/texts/types";

export class PPOCRExporter {
    public static export(): void {
        const zip = new JSZip();
        TextsSelector.getImagesData()
            .forEach((imageData: TextImageData) => {
                const fileContent: string = PPOCRExporter.wrapPolygonTextsIntoPPOCR(imageData);
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

    private static wrapPolygonTextsIntoPPOCR(imageData: TextImageData): string {
        if (imageData.textPolygons.length === 0 || !imageData.loadStatus)
            return null;

        const textPolygonString: string[] = imageData.textPolygons.map((textPolygon: TextPolygon) => {
            return PPOCRExporter.wrapPolygonTextIntoPPOCR(textPolygon)
        });
        return textPolygonString.join('\n');
    }

    public static wrapPolygonTextIntoPPOCR(textPolygon: TextPolygon): string {
        var text = textPolygon.text;
        const rawBBox: number[] = [
            textPolygon.vertices[0].x,
            textPolygon.vertices[0].y,
            textPolygon.vertices[1].x,
            textPolygon.vertices[1].y,
            textPolygon.vertices[2].x,
            textPolygon.vertices[2].y,
            textPolygon.vertices[3].x,
            textPolygon.vertices[3].y
        ]

        return [...rawBBox, text].join(',')
    }

}