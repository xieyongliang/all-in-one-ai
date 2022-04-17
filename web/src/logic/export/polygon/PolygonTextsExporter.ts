import {AnnotationFormatType} from "../../../data/enums/AnnotationFormatType";
import { PPOCRExporter } from "./PPOCRExporter";

export class PolygonTextsExporter {
    public static export(exportFormatType: AnnotationFormatType): void {
        switch (exportFormatType) {
            case AnnotationFormatType.PPOCR:
                PPOCRExporter.export();
                break;
            default:
                return;
        }
    }
}