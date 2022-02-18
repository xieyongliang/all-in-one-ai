import { FunctionComponent } from "react"

export interface ImageProps {
    src: string;
    alt?: string;
    width: number;
    height: number;
    current: string;
    onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
}

const Image: FunctionComponent<ImageProps> = (props) => {
    if(props.current.endsWith(props.src))
        return (
            <img
                    src={props.src}
                    width={props.width}
                    height={props.height}
                    alt={props.alt}
                    loading="lazy"
                    onClick={props.onClick}
                    style={{"border": "5px solid red"}}
                />
        )
    else
        return (
            <img
                    src={props.src}
                    width={props.width}
                    height={props.height}
                    alt={props.alt}
                    loading="lazy"
                    onClick={props.onClick}
                />
        )
}

export default Image;
