import { LabelImageData, LabelName } from "../../store/labels/types";
import { LabelType } from "../../data/enums/LabelType";

export type ImportResult = {
    imagesData: LabelImageData[]
    labelNames: LabelName[]
}

export class AnnotationImporter {
    public labelType: LabelType[]

    constructor(labelType: LabelType[]) {
        this.labelType = labelType;
    }

    public import(
        filesData: File[],
        onSuccess: (imagesData: LabelImageData[], labelNames: LabelName[]) => any,
        onFailure: (error?:Error) => any
    ): void {
        throw new Error("Method not implemented.");
    }
}