import {Action} from '../Actions';
import {PipelineActionTypes} from './types';

export function UpdatePipelineName(name: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_NAME,
        payload: {
            name,
        },
    };
}

export function UpdatePipelineType(type: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TYPE,
        payload: {
            type,
        },
    };
}

export function UpdateTrainingjobInstanceType(trainingjobInstanceType: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_INSTANCE_TYPE,
        payload: {
            trainingjobInstanceType,
        },
    };
}

export function UpdateTrainingjobInstanceCount(trainingjobInstanceCount: number): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_INSTANCE_COUNT,
        payload: {
            trainingjobInstanceCount,
        },
    };
}

export function UpdateTrainingjobVolumeSizeInGB(trainingjobVolumeSizeInGB: number): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_VOLUME_SIZE_IN_GB,
        payload: {
            trainingjobVolumeSizeInGB,
        },
    };
}

export function UpdateTrainingjobImageS3Uri(trainingjobImagesS3Uri: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_IMAGES_S3URI,
        payload: {
            trainingjobImagesS3Uri,
        },
    };
}

export function UpdateTrainingjobLabelsS3Uri(trainingjobLabelsS3Uri: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_LABELS_S3URI,
        payload: {
            trainingjobLabelsS3Uri,
        },
    };
}

export function UpdateTrainingjobWeightsS3Uri(trainingjobWeightsS3Uri: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_WEIGHTS_S3URI,
        payload: {
            trainingjobWeightsS3Uri,
        },
    };
}

export function UpdateTrainingjobCfgS3Uri(trainingjobCfgS3Uri: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_CFG_S3URI,
        payload: {
            trainingjobCfgS3Uri,
        },
    };
}

export function UpdateTrainingjobOutputS3Uri(trainingjobOutputS3Uri: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_OUTPUT_S3URI,
        payload: {
            trainingjobOutputS3Uri,
        },
    };
}

export function UpdateModelModelPackageGroupName(modelModelPackageGroupName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_MODEL_MODELPACKAGE_GROUP_NAME,
        payload: {
            modelModelPackageGroupName,
        },
    };
}

export function UpdateEndpointInstanceType(endpointInstanceType: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_ENDPOINT_INSTANCE_TYPE,
        payload: {
            endpointInstanceType,
        },
    };
}

export function UpdateEndpointAcceleratorType(endpointAcceleratorType: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_ENDPOINT_ACCELERATOR_TYPE,
        payload: {
            endpointAcceleratorType,
        },
    };
}

export function UpdateEndpointInitialInstanceCount(endpointInitialInstanceCount: number): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_ENDPOINT_INITIAl_INSTANCE_TYPE,
        payload: {
            endpointInitialInstanceCount,
        },
    };
}

export function UpdateEndpointInitialVariantWeight(endpointInitialVariantWeight: number): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_ENDPOINT_INITIAL_VARIANT_WEIGHT,
        payload: {
            endpointInitialVariantWeight,
        },
    };
}

export function UpdateApiName(apiName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_NAME,
        payload: {
            apiName,
        },
    };
}

export function UpdateApiRestApiName(apiRestApiName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_REST_API_NAME,
        payload: {
            apiRestApiName,
        },
    };
}

export function UpdateApiRestApiId(apiRestApiId: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_REST_API_ID,
        payload: {
            apiRestApiId,
        },
    };
}

export function UpdateApiType(apiType: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_TYPE,
        payload: {
            apiType,
        },
    };
}

export function UpdateApiPath(apiPath: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_PATH,
        payload: {
            apiPath,
        },
    };
}

export function UpdateApiStage(apiStage: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_STAGE,
        payload: {
            apiStage,
        },
    };
}

export function UpdateApiFuntion(apiFunction: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_FUNCTION,
        payload: {
            apiFunction,
        },
    };
}

export function UpdateApiMethod(apiMethod: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_API_METHOD,
        payload: {
            apiMethod,
        },
    };
}

export function UpdateGreenGrassComponentVersion(greengrassComponentVersion: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_COMPONENT_VERSION,
        payload: {
            greengrassComponentVersion,
        },
    };
}

export function UpdateGreenGrassDeploymentTargetType(greengrassDeploymentTargetType: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_TYPE,
        payload: {
            greengrassDeploymentTargetType,
        },
    };
}

export function UpdateGreenGrassDeploymentTargetArn(greengrassDeploymentTargetArn: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_ARN,
        payload: {
            greengrassDeploymentTargetArn,
        },
    };
}

export function UpdateGreenGrassDeploymentComponents(greengrassDeploymentComponents: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_COMPONENTS,
        payload: {
            greengrassDeploymentComponents,
        },
    };
}
