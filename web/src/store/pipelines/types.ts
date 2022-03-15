import {Action} from '../Actions';

export type PipelineState = {
    pipelineType: string;
    trainingjobInstanceType: string;
    trainingjobInstanceCount: number;
    trainingjobVolumeSizeInGB: number;
    trainingjobImagesS3Uri: string;
    trainingjobLabelsS3Uri: string;
    trainingjobWeightsS3Uri: string;
    trainingjobCfgS3Uri: string;
    trainingjobOutputS3Uri: string;
    modelModelPackageGroupName: string;
    modelModelPackageArn: string;
    endpointInstanceType: string;
    endpointAcceleratorType: string;
    endpointInitialInstanceCount: number;
    endpointInitialVariantWeight: number;
    apiRestApiName: string;
    apiRestApiId: string;
    apiType: string;
    apiPath: string;
    apiStage: string;
    apiFunction: string;
    apiMethod: string;
    greengrassComponentName: string;
    greengrassComponentVersion: string;
    greengrassDeploymentName: string;
    greengrassDeploymentTargetType: string;
    greengrassDeploymentTargetArn: string;
    greengrassDeploymentComponents: string;
}

interface UpdatePipelineType {
    type: typeof Action.UPDATE_PIPELINE_TYPE;
    payload: {
        pipelineType: string;
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

interface UpdateTrainingjobImageS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_IMAGES_S3URI;
    payload: {
        trainingjobImagesS3Uri: string;
    }
}

interface UpdateTrainingjobLebelsS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_LABELS_S3URI;
    payload: {
        trainingjobLabelsS3Uri: string;
    }
}

interface UpdateTrainingjobWeightsS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_WEIGHTS_S3URI;
    payload: {
        trainingjobWeightsS3Uri: string;
    }
}

interface UpdateTrainingjobCfgS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_CFG_S3URI;
    payload: {
        trainingjobCfgS3Uri: string;
    }
}

interface UpdateTrainingjobOutputS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_OUTPUT_S3URI;
    payload: {
        trainingjobOutputS3Uri: string;
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

interface UpdateApiRestApiName {
    type: typeof Action.UPDATE_PIPELINE_API_REST_API_NAME;
    payload: {
        apiRestApiName: string;
    }
}

interface UpdateApiRestApiId {
    type: typeof Action.UPDATE_PIPELINE_API_REST_API_ID;
    payload: {
        apiRestApiId: string;
    }
}

interface UpdateApiType {
    type: typeof Action.UPDATE_PIPELINE_API_TYPE;
    payload: {
        apiType: string;
    }
}

interface UpdateApiPath {
    type: typeof Action.UPDATE_PIPELINE_API_PATH;
    payload: {
        apiPath: string;
    }
}

interface UpdateApiStage {
    type: typeof Action.UPDATE_PIPELINE_API_STAGE;
    payload: {
        apiStage: string;
    }
}

interface UpdateApiFuntion {
    type: typeof Action.UPDATE_PIPELINE_API_FUNCTION;
    payload: {
        apiFunction: string;
    }
}

interface UpdateApiMethod {
    type: typeof Action.UPDATE_PIPELINE_API_METHOD;
    payload: {
        apiMethod: string;
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
    | UpdateTrainingjobInstanceType
    | UpdateTrainingjobInstanceCount
    | UpdateTrainingjobVolumeSizeInGB
    | UpdateTrainingjobImageS3Uri
    | UpdateTrainingjobLebelsS3Uri
    | UpdateTrainingjobWeightsS3Uri
    | UpdateTrainingjobCfgS3Uri
    | UpdateTrainingjobOutputS3Uri
    | UpdateModelModelPackageGroupName
    | UpdateModelModelPackageArn
    | UpdateEndpointInstanceType
    | UpdateEndpointAcceleratorType
    | UpdateEndpointInitialInstanceCount
    | UpdateEndpointInitialVariantWeight
    | UpdateApiRestApiName
    | UpdateApiRestApiId
    | UpdateApiType
    | UpdateApiPath
    | UpdateApiStage
    | UpdateApiFuntion
    | UpdateApiMethod
    | UpdateGreengrassComponentName
    | UpdateGreengrassComponentVersion
    | UpdateGreengrassDeploymentTargetType
    | UpdateGreengrassDeploymentName
    | UpdateGreengrassDeploymentTargetArn
    | UpdateGreengrassDeploymentComponents
