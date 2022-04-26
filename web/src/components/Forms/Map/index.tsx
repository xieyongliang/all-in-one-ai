import { Modal } from 'aws-northstar';
import { FunctionComponent, useState } from 'react';
import ImageMarker, { Marker } from 'react-image-marker';
import CameraForm from '../Camera';

const MapForm : FunctionComponent = () => {
    const [ markers ] = useState <Array<Marker>> ([
            {
                top: 16, 
                left: 38
            },
            {
                top: 16,
                left: 42
            },
            {
                top: 16,
                left: 47
            },
            {
                top: 16,
                left: 51
            },
            {
                top: 16,
                left: 56
            },
            {
                top: 23,
                left: 58
            },
            {
                top: 28,
                left: 58
            },
            {
                top: 33,
                left: 58
            },
            {
                top: 41,
                left: 58
            },
            {
                top: 59,
                left: 58
            },
            {
                top: 63,
                left: 56
            }
        ]);
    const [ visibleCamera, setVisibleCamera ] = useState(false);
    const [ curMarker, setCurMaker ] = useState(-1);
    
    if(visibleCamera)
        return (
            <Modal title={`Camera #${curMarker}`} visible={visibleCamera} onClose={()=>setVisibleCamera(false)} width={"100"}>
                <CameraForm />
            </Modal>
        )
    else
        return (
            <div onClick={(e) => {
                const target = e.currentTarget;

                // Get the bounding rectangle of target
                const rect = target.getBoundingClientRect();
            
                // Mouse position
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;    
                var index = 0; 
                markers.every((marker) => {
                    index++;
                    var left : number = parseInt(marker.left.toString())
                    var top : number = parseInt(marker.top.toString())
                    var x0 = left * rect.width / 100.0 + rect.x + 12.5;
                    var y0 = top * rect.height / 100.0 + rect.y + 12.5;
                    if(Math.abs(x + rect.x - x0) < 12.5 && Math.abs(y + rect.y - y0) < 12.5) {
                        setVisibleCamera(true);
                        setCurMaker(index);
                        return false;
                    }
                    else
                        return true;
               })
           }}>
            <ImageMarker
                src="MTR_routemap_510.jpeg"
                markers={markers}
            />
            </div>
        )
}

export default MapForm;