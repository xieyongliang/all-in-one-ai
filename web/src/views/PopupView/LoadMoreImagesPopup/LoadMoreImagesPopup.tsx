import React from 'react'
import './LoadMoreImagesPopup.scss'
import { AppState } from "../../../store";
import { connect } from "react-redux";
import { addLabelImageData } from "../../../store/labels/actionCreators";
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import { useDropzone } from "react-dropzone";
import { LabelImageData } from "../../../store/labels/types";
import { AcceptedFileType } from "../../../data/enums/AcceptedFileType";
import { PopupActions } from "../../../logic/actions/PopupActions";
import { LabelImageDataUtil } from "../../../utils/LabelImageDataUtil";

interface IProps {
    addLabelImageData: (imageData: LabelImageData[]) => any;
}

const LoadMoreImagesPopup: React.FC<IProps> = ({addLabelImageData}) => {
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
        accept: AcceptedFileType.IMAGE
    });

    const onAccept = () => {
        if (acceptedFiles.length > 0) {
            addLabelImageData(acceptedFiles.map((fileData:File) => LabelImageDataUtil.createLabelImageDataFromFileData(fileData)));
            PopupActions.close();
        }
    };

    const onReject = () => {
        PopupActions.close();
    };

    const getDropZoneContent = () => {
        if (acceptedFiles.length === 0)
            return <>
                <input {...getInputProps()} />
                <img
                    draggable={false}
                    alt={"upload"}
                    src={"/ico/box-opened.png"}
                />
                <p className="extraBold">Add new images</p>
                <p>or</p>
                <p className="extraBold">Click here to select them</p>
            </>;
        else if (acceptedFiles.length === 1)
            return <>
                <img
                    draggable={false}
                    alt={"uploaded"}
                    src={"/ico/box-closed.png"}
                />
                <p className="extraBold">1 new image loaded</p>
            </>;
        else
            return <>
                <img
                    draggable={false}
                    key={1}
                    alt={"uploaded"}
                    src={"/ico/box-closed.png"}
                />
                <p key={2} className="extraBold">{acceptedFiles.length} new images loaded</p>
            </>;
    };

    const renderContent = () => {
        return(<div className="LoadMoreImagesPopupContent">
            <div {...getRootProps({className: 'DropZone'})}>
                {getDropZoneContent()}
            </div>
        </div>);
    };

    return(
        <GenericYesNoPopup
            title={"Load more images"}
            renderContent={renderContent}
            acceptLabel={"Load"}
            disableAcceptButton={acceptedFiles.length < 1}
            onAccept={onAccept}
            rejectLabel={"Cancel"}
            onReject={onReject}
        />
    );
};

const mapDispatchToProps = {
    addLabelImageData
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoadMoreImagesPopup);