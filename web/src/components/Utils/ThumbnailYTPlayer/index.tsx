
import React from 'react';
import ReactPlayer, { ReactPlayerProps } from 'react-player';

// import YoutubeIframePlayer from '../YoutubeIframePlayer';

import PlayIconSvg from './PlayIconSvg';

import './_styles.scss';

const DEFAULT_PLAYER_PROPS: ReactPlayerProps = {
	url: undefined,
	pip: false,
	playing: true,
	controls: false,
	light: false,
	volume: 0.8,
	muted: false,
	played: 0,
	loaded: 0,
	duration: 0,
	playbackRate: 1.0,
	loop: false
};

export interface IThumbnailYTPlayerProps {
	/** youtube video id */
	videoId: string;
	thumbnailImage?: string;
	thumbnailTitle?: string;
}

export const ThumbnailYTPlayer: React.FunctionComponent<IThumbnailYTPlayerProps> = ({
	videoId,
	thumbnailImage,
	thumbnailTitle
}) => {
	const [play, setPlay] = React.useState(false);

	const [playerProps, setPlayerProps] = React.useState({
		...DEFAULT_PLAYER_PROPS
	});
	const onThumbLayerClick = () => {
		setPlay(true);
		window.setTimeout(() => {
			setPlayerProps((oldState) => ({
				...oldState,
				url: `https://www.youtube.com/watch?v=${videoId}`
			}));
		}, 100);
	};

	React.useEffect(() => {
		console.log(playerProps);
	}, [playerProps]);

	return (
		<div className="thumbnail-yt-player">
			{thumbnailImage && !play && (
				<div
					className="thumbnail-yt-player__thumb"
					onClick={onThumbLayerClick}
					style={{
						backgroundImage: `url(${thumbnailImage})`,
						backgroundPosition: 'center',
						backgroundSize: '80%',
						backgroundRepeat: 'no-repeat',
						opacity: '0.6'
					}}
				>
					<div className="thumbnail-yt-player__thumb-icon">
						<PlayIconSvg width="50px" />
					</div>
					<div className="thumbnail-yt-player__thumb-title">
						{thumbnailTitle}
					</div>
				</div>
			)}

			{/*play && (
				// <YoutubeIframePlayer
				// 	className="thumbnail-yt-player__iframe"
				// 	videoId={videoId}
				// 	disableControls
				// 	autoplay
				// />
			)*/}
			<ReactPlayer
				className="thumbnail-yt-player__iframe"
				width="100%"
				height="100%"
				{...playerProps}
			/>
		</div>
	);
};

export default ThumbnailYTPlayer;
