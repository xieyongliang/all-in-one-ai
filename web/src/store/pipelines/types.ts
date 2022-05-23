import { Action } from '../Actions';

export type PipelineState = {
    pipelineType: string;
    industrialModel: string;
    scritpMode: boolean;
    trainingjobName: string;
    trainingjobInstanceType: string;
    trainingjobInstanceCount: number;
    trainingjobVolumeSizeInGB: number;
    trainingjobInputData: any[];
    trainingjobHyperparameters: any[];
    trainingjobOutputS3Uri: string;
    modelName: string;
    modelAlgorithm: string;
    modelModelPackageGroupName: string;
    modelModelPackageArn: string;
    modelEnvironment: any[];
    modelDataUrl: string;
    endpointName: string;
    endpointInstanceType: string;
    endpointAcceleratorType: string;
    endpointInitialInstanceCount: number;
    endpointInitialVariantWeight: number;
    greengrassComponentName: string;
    greengrassComponentVersion: string;
    greengrassDeploymentName: string;
    greengrassDeploymentTargetType: string;
    greengrassDeploymentTargetArn: string;
    greengrassDeploymentComponents: string
}

interface UpdatePipelineType {
    type: typeof Action.UPDATE_PIPELINE_TYPE;
    payload: {
        pipelineType: string;
    }
}

interface UpdateIndustrialModel {
    type: typeof Action.UPDATE_PIPELINE_INDUSTRIAL_MODEL;
    payload: {
        industrialModel: string;
    }
}

interface UpdateScriptMode {
    type: typeof Action.UPDATE_PIPELINE_SCRIPT_MODE;
    payload: {
        scriptMode: boolean;
    }
}

interface UpdateTrainingjobName {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_NAME;
    payload: {
        trainingjobName: string;
    }
}

interface UpdateTrainingjobInstanceType {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_INSTANCE_TYPE;
    payload: {
        trainingjobInstanceType: string;
    }
}

interface UpdateTrainingjobInstanceCount {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_INSTANCE_COUNT;
    payload: {
        trainingjobInstanceCount: number;
    }
}

interface UpdateTrainingjobVolumeSizeInGB {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_VOLUME_SIZE_IN_GB;
    payload: {
        trainingjobVolumeSizeInGB: number;
    }
}

interface UpdateTrainingjobInputData {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_INPUT_DATA;
    payload: {
        trainingjobInputData: any[];
    }
}

interface UpdateTrainingjobHyperparameters {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_HYPERPARAMETERS;
    payload: {
        trainingjobHyperparameters: any[];
    }
}

interface UpdateTrainingjobOutputS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_OUTPUT_S3URI;
    payload: {
        trainingjobOutputS3Uri: string;
    }
}

interface UpdateModelName {
    type: typeof Action.UPDATE_PIPELINE_MODEL_NAME;
    payload: {
        modelName: string;
    }
}

interface UpdateModelAlgorithm {
    type: typeof Action.UPDATE_PIPELINE_MODEL_ALGORITHM;
    payload: {
        modelAlgorithm: string;
    }
}

interface UpdateModelDataUrl {
    type: typeof Action.UPDATE_PIPELINE_MODEL_DATA_URL;
    payload: {
        modelDataUrl: string;
    }
}

interface UpdateModelEnvironment {
    type: typeof Action.UPDATE_PIPELINE_MODEL_ENVIRONMENT;
    payload: {
        modelEnvironment: any[];
    }
}
interface UpdateModelModelPackageGroupName {
    type: typeof Action.UPDATE_PIPELINE_MODEL_MODELPACKAGE_GROUP_NAME;
    payload: {
        modelModelPackageGroupName: string;
    }
}

interface UpdateModelModelPackageArn {
    type: typeof Action.UPDATE_PIPELINE_MODEL_MODELPACKAGE_ARN;
    payload: {
        modelModelPackageArn: string;
    }
}

interface UpdateEndpointName {
    type: typeof Action.UPDATE_PIPELINE_ENDPOINT_NAME;
    payload: {
        endpointName: string;
    }
}

interface UpdateEndpointInstanceType {
    type: typeof Action.UPDATE_PIPELINE_ENDPOINT_INSTANCE_TYPE;
    payload: {
        endpointInstanceType: string;
    }
}

interface UpdateEndpointAcceleratorType {
    type: typeof Action.UPDATE_PIPELINE_ENDPOINT_ACCELERATOR_TYPE;
    payload: {
        endpointAcceleratorType: string;
    }
}

interface UpdateEndpointInitialInstanceCount {
    type: typeof Action.UPDATE_PIPELINE_ENDPOINT_INITIAl_INSTANCE_TYPE;
    payload: {
        endpointInitialInstanceCount: number;
    }
}

interface UpdateEndpointInitialVariantWeight {
    type: typeof Action.UPDATE_PIPELINE_ENDPOINT_INITIAL_VARIANT_WEIGHT;
    payload: {
        endpointInitialVariantWeight: number;
    }
}

interface UpdateGreengrassComponentName {
    type: typeof Action.UPDATE_PIPELINE_GREENGRASS_COMPONENT_NAME;
    payload: {
        greengrassComponentName: string;
    }
}

interface UpdateGreengrassComponentVersion {
    type: typeof Action.UPDATE_PIPELINE_GREENGRASS_COMPONENT_VERSION;
    payload: {
        greengrassComponentVersion: string;
    }
}

interface UpdateGreengrassDeploymentName {
    type: typeof Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_NAME;
    payload: {
        greengrassDeploymentName: string;
    }
}

interface UpdateGreengrassDeploymentTargetType {
    type: typeof Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_TYPE;
    payload: {
        greengrassDeploymentTargetType: string;
    }
}

interface UpdateGreengrassDeploymentTargetArn {
    type: typeof Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_ARN;
    payload: {
        greengrassDeploymentTargetArn: string;
    }
}

interface UpdateGreengrassDeploymentComponents {
    type: typeof Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_COMPONENTS;
    payload: {
        greengrassDeploymentComponents: string;
    }
}

export type PipelineActionTypes = UpdatePipelineType
    | UpdateIndustrialModel
    | UpdateScriptMode
    | UpdateTrainingjobName
    | UpdateTrainingjobInstanceType
    | UpdateTrainingjobInstanceCount
    | UpdateTrainingjobVolumeSizeInGB
    | UpdateTrainingjobInputData
    | UpdateTrainingjobHyperparameters
    | UpdateTrainingjobOutputS3Uri
    | UpdateModelName
    | UpdateModelAlgorithm
    | UpdateModelModelPackageGroupName
    | UpdateModelModelPackageArn
    | UpdateModelDataUrl
    | UpdateModelEnvironment
    | UpdateEndpointName
    | UpdateEndpointInstanceType
    | UpdateEndpointAcceleratorType
    | UpdateEndpointInitialInstanceCount
    | UpdateEndpointInitialVariantWeight
    | UpdateGreengrassComponentName
    | UpdateGreengrassComponentVersion
    | UpdateGreengrassDeploymentName
    | UpdateGreengrassDeploymentTargetType
    | UpdateGreengrassDeploymentTargetArn
    | UpdateGreengrassDeploymentComponents
