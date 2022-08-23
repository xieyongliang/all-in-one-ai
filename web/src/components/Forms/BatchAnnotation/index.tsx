import { FunctionComponent } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ImagePanel from '../../Utils/ImagePanel';


const BatchAnnotationForm: FunctionComponent = () => {
    var history = useHistory();
    var location = useLocation();

    var hash = decodeURI(location.hash.substring(1, location.hash.length - 1))

    var data = JSON.parse(hash)

    var s3uri = data.s3uri
    var labels = data.labels
    var projectName = data.projectName

    const onClose = () => {
        history.goBack();
    }

    return (
        <ImagePanel 
            s3uri={s3uri} 
            labels={labels}
            projectName={projectName} 
            onClose={onClose} 
        />
    )
}

export default BatchAnnotationForm;