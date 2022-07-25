import { Button } from "aws-northstar"
import { FunctionComponent, useRef } from "react"
import CloudUploadIcon from "@material-ui/icons/CloudUpload"

interface IProps {
    text: string,
    onChange:(file)=>any
}

const FileUpload : FunctionComponent<IProps> = ({
    text,
    onChange
}) => {
    const fileInput = useRef(null)
    
    return  (
        <div>
            <input 
                type='file' 
                style={{display:'none'}} 
                onChange={(e) => {if(e.target.files.length > 0) onChange(e.target.files[0])}}
                ref = {fileInput}
            />
            <Button icon={CloudUploadIcon} onClick={() => fileInput.current && fileInput.current.click()}>
                {text}
            </Button>
        </div>
    )
}

export default FileUpload;