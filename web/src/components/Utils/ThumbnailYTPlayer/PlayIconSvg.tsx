import * as React from 'react';

export interface IPlayIconSvgProps {
	width?: string;
	height?: string;
}

export const PlayIconSvg: React.FunctionComponent<IPlayIconSvgProps> = ({
	width = '20px',
	height = width
}) => (
	<svg
		width={width}
		height={height}
		viewBox="0 0 512 512"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="m256 512c-140.609375 0-256-115.390625-256-256s115.390625-256 256-256 256 115.390625 256 256-115.390625 256-256 256zm0 0"
			fill="#deecf1"
		/>
		<path
			d="m512 256c0-140.609375-115.390625-256-256-256v512c140.609375 0 256-115.390625 256-256zm0 0"
			fill="#c6e2e7"
		/>
		<path
			d="m181 107.976562v296.046876l222.039062-148.023438zm0 0"
			fill="#384949"
		/>
		<path
			d="m256 354.023438 147.039062-98.023438-147.039062-98.023438zm0 0"
			fill="#293939"
		/>
	</svg>
);

export default PlayIconSvg;
