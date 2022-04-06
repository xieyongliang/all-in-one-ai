import React, {useState} from 'react';
import './MainView.scss';
import classNames from 'classnames';
import {ISize} from '../../interfaces/ISize';
import {ImageButton} from '../Common/ImageButton/ImageButton';
import {ISocialMedia, SocialMediaData} from '../../data/info/SocialMediaData';
import {EditorFeatureData, IEditorFeature} from '../../data/info/EditorFeatureData';
import {Tooltip} from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import withStyles from '@material-ui/core/styles/withStyles';
import ImagesDropZone from './ImagesDropZone/ImagesDropZone';

const MainView: React.FC = () => {
    const [projectInProgress, setProjectInProgress] = useState(true);
    const [projectCanceled, setProjectCanceled] = useState(false);

    const getClassName = () => {
        return classNames(
            'MainView', {
                'InProgress': projectInProgress,
                'Canceled': !projectInProgress && projectCanceled
            }
        );
    };

    const DarkTooltip = withStyles(theme => ({
        tooltip: {
            backgroundColor: '#171717',
            color: '#ffffff',
            boxShadow: theme.shadows[1],
            fontSize: 11,
            maxWidth: 120
        },
    }))(Tooltip);

    const getSocialMediaButtons = (size:ISize) => {
        return SocialMediaData.map((data:ISocialMedia, index: number) => {
            return <DarkTooltip
                key={index}
                disableFocusListener={true}
                title={data.tooltipMessage}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement='left'
            >
                <div>
                    <ImageButton
                        buttonSize={size}
                        image={data.imageSrc}
                        imageAlt={data.imageAlt}
                        href={data.href}
                    />
                </div>
            </DarkTooltip>
        });
    };

    const getEditorFeatureTiles = () => {
        return EditorFeatureData.map((data:IEditorFeature) => {
            return <div
                className='EditorFeaturesTiles'
                key={data.displayText}
            >
                <div
                    className='EditorFeaturesTilesWrapper'
                >
                    <img
                        draggable={false}
                        alt={data.imageAlt}
                        src={data.imageSrc}
                    />
                    <div className='EditorFeatureLabel'>
                        {data.displayText}
                    </div>
                </div>
            </div>
        });
    };

    return (
        <div className={getClassName()}>
            <div className='RightColumn'>
                <ImagesDropZone/>
            </div>
        </div>
    );
};

export default MainView;
