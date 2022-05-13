import { FunctionComponent, useState } from 'react';
import ReactHlsPlayer from 'react-hls-player';
import Grid from '@mui/material/Grid';

const CameraForm: FunctionComponent = () => {
    const [ hls ] = useState('')

    const renderCamera = () => {
        return (
            <div className='player-wrapper'>
                <ReactHlsPlayer
                    playerRef={undefined}
                    src={hls}
                    autoPlay={false}
                    controls={true}
                    width="auto"
                    height="auto"        
                />
            </div>
        )
    }

    return (
        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 12, md: 12 }}>
            <Grid item xs={2} sm={4} md={4}>
                { renderCamera() }
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                { renderCamera() }
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                { renderCamera() }
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                { renderCamera() }
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                { renderCamera() }
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                { renderCamera() }
            </Grid>
        </Grid>
    )
}

export default CameraForm;