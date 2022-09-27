import { FunctionComponent } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ImagePanel from '../../Utils/ImagePanel';
import { ProjectType } from '../../../data/enums/ProjectType'

const BatchAnnotationForm: FunctionComponent = () => {
    var history = useHistory();
    var location = useLocation();

    var hash = decodeURI(location.hash.substring(1, location.hash.length - 1))

    var data = JSON.parse(hash)

    var s3uri = data.s3uri
    var labels = data.labels
    var type = data.type
    var subType = data.subType
    var projectName = data.projectName

    const onClose = () => {
        history.goBack();
    }

    if (type === undefined)
        type = ProjectType.OBJECT_DETECTION_RECT
    
    return (
        <ImagePanel
            type={type}
            subType={subType}
            s3uri={s3uri} 
            labels={labels}
            projectName={projectName} 
            onClose={onClose} 
        />
    )
}

export default BatchAnnotationForm;