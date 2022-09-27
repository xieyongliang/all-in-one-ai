import { store } from "../..";
import { Action } from "../../store/Actions";
import { updateRankImageDataById } from "../../store/ranks/actionCreators";
import { RanksSelector } from "../../store/selectors/RanksSelector";

export class RankImporter {
    public import(fileName, content) {
        var imageData = RanksSelector.getImagesData().find((item) => {
            var name1 = item.fileData.name.substring(0, item.fileData.name.lastIndexOf('.'))
            var name2 = fileName.substring(0, fileName.lastIndexOf('.'))
            return name1 === name2
        })
        if(imageData !== undefined)
            imageData.rank = content;

        store.dispatch(
            { 
                type: Action.UPDATE_RANK_IMAGE_DATA_BY_ID, 
                payload: {
                    id: imageData.id,
                    newImageData: imageData
                }
            }
        )    
        updateRankImageDataById(imageData.id, imageData);
    }
}