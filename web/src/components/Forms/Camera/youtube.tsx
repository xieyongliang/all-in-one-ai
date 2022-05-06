import { FunctionComponent } from 'react';
import ThumbnailYRPlayer from '../../Utils/ThumbnailYTPlayer'
import Grid from '@mui/material/Grid';

const YoutubeForm: FunctionComponent = () => {
    return (
        <div className="body">
        <Grid container spacing={{ xs: 4, md: 4 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Grid item xs={2} sm={4} md={4}>
                <ThumbnailYRPlayer
                    videoId="tM1rMDxciOw"
                    thumbnailImage="camera.jpg"
                />                                        
            </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <ThumbnailYRPlayer
                        videoId="R8TLbiiZMyY"
                        thumbnailImage="camera.jpg"
                    />                    
                </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <ThumbnailYRPlayer
                        videoId="1inLwagBRzo"
                        thumbnailImage="camera.jpg"
                    />                                   
                </Grid>
            <Grid item xs={2} sm={4} md={4}>
                <ThumbnailYRPlayer
                    videoId="tM1rMDxciOw"
                    thumbnailImage="camera.jpg"
                />                        
            </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <ThumbnailYRPlayer
                    videoId="R8TLbiiZMyY"
                    thumbnailImage="camera.jpg"
                />                
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                <ThumbnailYRPlayer
                    videoId="1inLwagBRzo"
                    thumbnailImage="camera.jpg"
            />
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                <ThumbnailYRPlayer
                    videoId="tM1rMDxciOw"
                    thumbnailImage="camera.jpg"
                />                        
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                <ThumbnailYRPlayer
                    videoId="R8TLbiiZMyY"
                    thumbnailImage="camera.jpg"
                />                        
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
                <ThumbnailYRPlayer
                    videoId="1inLwagBRzo"
                    thumbnailImage="camera.jpg"
                />                                   
            </Grid>
        </Grid>
    </div>
)
}

export default YoutubeForm;