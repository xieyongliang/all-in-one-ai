import React from 'react'
import './ExitProjectPopup.scss'
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import {
    updateActiveLabelImageIndex,
    updateActiveLabelNameId,
    updateFirstLabelCreatedFlag,
    updateLabelImageData,
    updateLabelNames
} from "../../../store/labels/actionCreators";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import { LabelImageData, LabelName } from "../../../store/labels/types";
import { PopupActions} from "../../../logic/actions/PopupActions";
import { ProjectData } from "../../../store/general/types";
import { updateProjectData } from "../../../store/general/actionCreators";

interface IProps {
    updateActiveLabelImageIndex: (activeImageIndex: number) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateLabelNames: (labelNames: LabelName[]) => any;
    updateLabelImageData: (imageData: LabelImageData[]) => any;
    updateFirstLabelCreatedFlag: (firstLabelCreatedFlag: boolean) => any;
    updateProjectData: (projectData: ProjectData) => any;
}

const ExitProjectPopup: React.FC<IProps> = (props) => {
    const {
        updateActiveLabelNameId,
        updateLabelNames,
        updateActiveLabelImageIndex,
        updateLabelImageData,
        updateFirstLabelCreatedFlag,
        updateProjectData
    } = props;

    const renderContent = () => {
        return(
            <div className="ExitProjectPopupContent">
                <div className="Message">
                    Are you sure you want to leave the editor? You will permanently lose all your progress.
                </div>
            </div>
        )
    };

    const onAccept = () => {
        updateActiveLabelNameId(null);
        updateLabelNames([]);
        updateProjectData({type: null, subType: null, name: "my-project-name"});
        updateActiveLabelImageIndex(null);
        updateLabelImageData([]);
        updateFirstLabelCreatedFlag(false);
        PopupActions.close();
    };

    const onReject = () => {
        PopupActions.close();
    };

    return(
        <GenericYesNoPopup
            title={"Exit project"}
            renderContent={renderContent}
            acceptLabel={"Exit"}
            onAccept={onAccept}
            rejectLabel={"Back"}
            onReject={onReject}
        />)
};

const mapDispatchToProps = {
    updateActiveLabelNameId,
    updateLabelNames,
    updateProjectData,
    updateActiveLabelImageIndex,
    updateLabelImageData,
    updateFirstLabelCreatedFlag
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExitProjectPopup);