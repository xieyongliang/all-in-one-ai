import { Action } from '../Actions';

export type PipelineState = {
    pipelineType: string;
    trainingjobInstanceType: string;
    trainingjobInstanceCount: number;
    trainingjobVolumeSizeInGB: number;
    trainingjobImagesS3Uri: string;
    trainingjobLabelsS3Uri: string;
    trainingjobWeightsS3Uri: string;
    trainingjobCfgS3Uri: string;
    trainingjobTrainingS3Uri: string;
    trainingjobValidationS3Uri: string;
    trainingjobTestS3Uri: string;
    trainingjobHyperparameters: string;
    trainingjobOutputS3Uri: string;
    modelAlgorithm: string;
    modelModelPackageGroupName: string;
    modelModelPackageArn: string;
    modelEnvironment: Object;
    modelDataUrl: string;
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

interface UpdateTrainingjobTrainingS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_TRAINING_S3URI;
    payload: {
        trainingjobTrainingS3Uri: string;
    }
}

interface UpdateTrainingjobValidationS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_VALIDATION_S3URI;
    payload: {
        trainingjobValidationS3Uri: string;
    }
}

interface UpdateTrainingjobTestS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_TEST_S3URI;
    payload: {
        trainingjobTestS3Uri: string;
    }
}

interface UpdateTrainingjobHyperparameters {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_HYPERPARAMETERS;
    payload: {
        trainingjobHyperparameters: string;
    }
}

interface UpdateTrainingjobOutputS3Uri {
    type: typeof Action.UPDATE_PIPELINE_TRAINING_JOB_OUTPUT_S3URI;
    payload: {
        trainingjobOutputS3Uri: string;
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
        modelEnvironment: Object;
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
    | UpdateTrainingjobTrainingS3Uri
    | UpdateTrainingjobValidationS3Uri
    | UpdateTrainingjobTestS3Uri
    | UpdateTrainingjobHyperparameters
    | UpdateTrainingjobOutputS3Uri
    | UpdateModelAlgorithm
    | UpdateModelModelPackageGroupName
    | UpdateModelModelPackageArn
    | UpdateModelDataUrl
    | UpdateModelEnvironment
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
