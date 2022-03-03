import { FunctionComponent } from "react"
import "./index.scss"

export interface ImageProps {
    src: string;
    alt?: string;
    width: number;
    height: number;
    current: string;
    public?: boolean;
    onClick?: (src) => void;
}

const Image: FunctionComponent<ImageProps> = (props) => {
    const onLoad = (event) => {
        event.target.parentNode.className = 'watermarked'
    }
    if(props.public === true) {
        if(props.current.endsWith(props.src))
            return (
                <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                    <img
                        src={props.src}
                        width={props.width}
                        height={props.height}
                        alt={props.alt}
                        loading="lazy"
                        style={{"border": "5px solid red"}}
                    />
                </div>
            )
        else
            return (
                <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                    <img
                        src={props.src}
                        width={props.width}
                        height={props.height}
                        alt={props.alt}
                        loading="lazy"
                    />
                </div>
            )
    } else {
        if(props.current.endsWith(props.src))
            return (
                <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                    <img
                        src={props.src}
                        width={props.width}
                        height={props.height}
                        alt={props.alt}
                        loading="lazy"
                        onLoad={onLoad}
                        style={{"border": "5px solid red"}}
                    />
                </div>
            )
        else
            return (
                <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                    <img
                        src={props.src}
                        width={props.width}
                        height={props.height}
                        alt={props.alt}
                        loading="lazy"
                        onLoad={onLoad}
                    />
                </div>
            )
    }
}

export default Image;
