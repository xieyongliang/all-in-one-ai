import { Popover } from 'aws-northstar';
import { FunctionComponent } from 'react'
import './index.scss'

export interface ImageProps {
    src: string;
    alt?: string;
    width: number | string;
    height: number | string;
    current?: string;
    public?: boolean;
    tooltip?: string;
    onClick?: (src) => void;
}

const Image: FunctionComponent<ImageProps> = (props) => {
    const onLoad = (event) => {
        if(props.tooltip !== undefined)
            event.target.parentNode.parentNode.className = 'watermarked'
        else
            event.target.parentNode.className = 'watermarked'
    }
    if(props.public === true) {
        if(props.current !==  undefined && props.current.endsWith(props.src)) {
            if(props.tooltip !== undefined)
                return (
                    <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                        <Popover
                            triggerType="text"
                            variant="hover"
                            showDismissButton={false}
                            content={
                                <span>{props.tooltip}</span>
                            }>                  
                            <img
                                src={props.src}
                                width={props.width}
                                height={props.height}
                                alt={props.alt}
                                loading='lazy'
                                style={{'border': '5px solid red'}}
                            />
                        </Popover>
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
                            loading='lazy'
                            style={{'border': '5px solid red'}} 
                        />
                    </div>
            )
        }
        else {
            if(props.tooltip !== undefined) 
                return (
                    <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                        <Popover
                            triggerType="text"
                            variant="hover"
                            showDismissButton={false}
                            content={
                                <span>{props.tooltip}</span>
                            }>                  
                            <img
                                src={props.src}
                                width={props.width}
                                height={props.height}
                                alt={props.alt}
                                loading='lazy'
                            />
                        </Popover>
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
                            loading='lazy'
                        />
                    </div>
                )
        }
    } 
    else {
        if(props.current !== undefined && props.current.endsWith(props.src))
            if(props.tooltip !== undefined)
                return (
                    <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                        <Popover
                            triggerType="text"
                            variant="hover"
                            showDismissButton={false}
                            content={
                                <span>{props.tooltip}</span>
                            }>                  
                            <img
                                src={props.src}
                                width={props.width}
                                height={props.height}
                                alt={props.alt}
                                loading='lazy'
                                onLoad={onLoad}
                                style={{'border': '5px solid red'}}
                            />
                        </Popover>
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
                            loading='lazy'
                            onLoad={onLoad}
                            style={{'border': '5px solid red'}}
                        />
                    </div>
                )
        else
            if(props.tooltip !== undefined)
                return (
                    <div onClick={(event)=>{if(props.onClick !== undefined) props.onClick(props.src)}}>
                        <Popover
                            triggerType="text"
                            variant="hover"
                            showDismissButton={false}
                            content={
                                <span>{props.tooltip}</span>
                            }>                  
                            <img
                                src={props.src}
                                width={props.width}
                                height={props.height}
                                alt={props.alt}
                                loading='lazy'
                                onLoad={onLoad}
                            />
                        </Popover>
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
                            loading='lazy'
                            onLoad={onLoad}
                            onClick={props.onClick}
                        />
                    </div>
                )
    }
}

export default Image;
