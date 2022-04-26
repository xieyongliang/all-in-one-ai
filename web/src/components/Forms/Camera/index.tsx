import { FunctionComponent } from 'react';
import ReactPlayer from 'react-player';

const CameraForm: FunctionComponent = () => {
    return (
        <div className='player-wrapper'>
            <ReactPlayer
            className='react-player fixed-bottom'
            url= 'test_video.mp4'
            width='100%'
            height='100%'
            controls = {true}
            />
        </div>
    )
}

export default CameraForm;