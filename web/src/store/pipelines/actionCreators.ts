import { Action } from '../Actions';
import { PipelineActionTypes } from './types';

export function UpdatePipelineType(pipelineType: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TYPE,
        payload: {
            pipelineType,
        },
    };
}

export function UpdateIndustrialModel(industrialModel: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_INDUSTRIAL_MODEL,
        payload: {
            industrialModel,
        },
    };
}

export function UpdateScriptMode(scriptMode: boolean): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_SCRIPT_MODE,
        payload: {
            scriptMode,
        },
    };
}

export function UpdateTrainingjobName(trainingjobName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_NAME,
        payload: {
            trainingjobName,
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

export function UpdateTrainingjobInputData(trainingjobInputData: any[]): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_INPUT_DATA,
        payload: {
            trainingjobInputData,
        },
    };
}

export function UpdateTrainingjobHyperparameters(trainingjobHyperparameters: any[]): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_TRAINING_JOB_HYPERPARAMETERS,
        payload: {
            trainingjobHyperparameters,
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

export function UpdateModelName(modelName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_MODEL_NAME,
        payload: {
            modelName,
        },
    };
}

export function UpdateModelAlgorithm(modelAlgorithm: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_MODEL_ALGORITHM,
        payload: {
            modelAlgorithm,
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

export function UpdateModelModelPackageArn(modelModelPackageArn: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_MODEL_MODELPACKAGE_ARN,
        payload: {
            modelModelPackageArn,
        },
    };
}

export function UpdateModelDataUrl(modelDataUrl: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_MODEL_DATA_URL,
        payload: {
            modelDataUrl,
        },
    };
}

export function UpdateModelEnvironment(modelEnvironment: any[]): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_MODEL_ENVIRONMENT,
        payload: {
            modelEnvironment,
        },
    };
}

export function UpdateEndpointName(endpointName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_ENDPOINT_NAME,
        payload: {
            endpointName,
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

export function UpdateGreengrassComponentName(greengrassComponentName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_COMPONENT_NAME,
        payload: {
            greengrassComponentName,
        },
    };
}

export function UpdateGreengrassComponentVersion(greengrassComponentVersion: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_COMPONENT_VERSION,
        payload: {
            greengrassComponentVersion,
        },
    };
}

export function UpdateGreengrassDeploymentName(greengrassDeploymentName: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_NAME,
        payload: {
            greengrassDeploymentName,
        },
    };
}

export function UpdateGreengrassDeploymentTargetType(greengrassDeploymentTargetType: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_TYPE,
        payload: {
            greengrassDeploymentTargetType,
        },
    };
}

export function UpdateGreengrassDeploymentTargetArn(greengrassDeploymentTargetArn: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_ARN,
        payload: {
            greengrassDeploymentTargetArn,
        },
    };
}

export function UpdateGreengrassDeploymentComponents(greengrassDeploymentComponents: string): PipelineActionTypes {
    return {
        type: Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_COMPONENTS,
        payload: {
            greengrassDeploymentComponents,
        },
    };
}