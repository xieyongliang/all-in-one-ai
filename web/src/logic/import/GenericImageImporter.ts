import { store } from "../..";
import { Action } from "../../store/Actions";
import { updateGenericImageDataById } from "../../store/genericimages/actionCreators";
import { GenericImageSelector } from "../../store/selectors/GenericImageSelector";

export class GenericImageImporter {
    public import(fileName, content) {
        var imageData = GenericImageSelector.getImagesData().find((item) => {
            var name1 = item.fileData.name.substring(0, item.fileData.name.lastIndexOf('.'))
            var name2 = fileName.substring(0, fileName.lastIndexOf('.'))
            return name1 === name2
        })
        if(imageData !== undefined)
            imageData.value = content;

        store.dispatch(
            { 
                type: Action.UPDATE_RANK_IMAGE_DATA_BY_ID, 
                payload: {
                    id: imageData.id,
                    newImageData: imageData
                }
            }
        )    
        updateGenericImageDataById(imageData.id, imageData);
    }
}