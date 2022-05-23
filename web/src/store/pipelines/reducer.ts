import { PipelineActionTypes, PipelineState } from './types';
import { Action } from '../Actions';

const initialState: PipelineState = {
    pipelineType: '0',
    industrialModel: '',
    scritpMode: true,
    trainingjobName: '',
    trainingjobInstanceType: '',
    trainingjobInstanceCount: 1,
    trainingjobVolumeSizeInGB: 30,
    trainingjobInputData: [],
    trainingjobHyperparameters: [],
    trainingjobOutputS3Uri: '',
    modelName: '',
    modelAlgorithm: '',
    modelModelPackageGroupName: '',
    modelModelPackageArn: '',
    modelDataUrl: '',
    modelEnvironment: [],
    endpointName: '',
    endpointInstanceType: '',
    endpointAcceleratorType: '',
    endpointInitialInstanceCount: 1,
    endpointInitialVariantWeight: 1,
    greengrassComponentName: '',
    greengrassComponentVersion: '',
    greengrassDeploymentName: '',
    greengrassDeploymentTargetType: '1',
    greengrassDeploymentTargetArn: '',
    greengrassDeploymentComponents: '[]',
};

export function pipelineReducer(
    state = initialState,
    action: PipelineActionTypes
): PipelineState {
    switch (action.type) {
        case Action.UPDATE_PIPELINE_TYPE: {
            return {
                ...state,
                pipelineType: action.payload.pipelineType
            }
        }
        case Action.UPDATE_PIPELINE_INDUSTRIAL_MODEL: {
            return {
                ...state,
                industrialModel: action.payload.industrialModel
            }
        }   
        case Action.UPDATE_PIPELINE_SCRIPT_MODE: {
            return {
                ...state,
                scritpMode: action.payload.scriptMode
            }
        }
        case Action.UPDATE_PIPELINE_TRAINING_JOB_NAME: {
            return {
                ...state,
                trainingjobName: action.payload.trainingjobName
            }
        }        
        case Action.UPDATE_PIPELINE_TRAINING_JOB_INSTANCE_TYPE: {
            return {
                ...state,
                trainingjobInstanceType: action.payload.trainingjobInstanceType
            }
        }
        case Action.UPDATE_PIPELINE_TRAINING_JOB_INSTANCE_COUNT: {
            return {
                ...state,
                trainingjobInstanceCount: action.payload.trainingjobInstanceCount
            }
        }
        case Action.UPDATE_PIPELINE_TRAINING_JOB_VOLUME_SIZE_IN_GB: {
            return {
                ...state,
                trainingjobVolumeSizeInGB: action.payload.trainingjobVolumeSizeInGB
            }
        }
        case Action.UPDATE_PIPELINE_TRAINING_JOB_INPUT_DATA: {
            return {
                ...state,
                trainingjobInputData: action.payload.trainingjobInputData
            }
        }
        case Action.UPDATE_PIPELINE_TRAINING_JOB_HYPERPARAMETERS: {
            return {
                ...state,
                trainingjobHyperparameters: action.payload.trainingjobHyperparameters
            }
        }
        case Action.UPDATE_PIPELINE_TRAINING_JOB_OUTPUT_S3URI: {
            return {
                ...state,
                trainingjobOutputS3Uri: action.payload.trainingjobOutputS3Uri
            }
        }
        case Action.UPDATE_PIPELINE_MODEL_NAME: {
            return {
                ...state,
                modelName: action.payload.modelName
            }
        }
        case Action.UPDATE_PIPELINE_MODEL_ALGORITHM: {
            return {
                ...state,
                modelAlgorithm: action.payload.modelAlgorithm
            }
        }        case Action.UPDATE_PIPELINE_MODEL_MODELPACKAGE_GROUP_NAME: {
            return {
                ...state,
                modelModelPackageGroupName: action.payload.modelModelPackageGroupName
            }
        }
        case Action.UPDATE_PIPELINE_MODEL_MODELPACKAGE_ARN: {
            return {
                ...state,
                modelModelPackageArn: action.payload.modelModelPackageArn
            }
        }
        case Action.UPDATE_PIPELINE_MODEL_ENVIRONMENT: {
            return {
                ...state,
                modelEnvironment: action.payload.modelEnvironment
            }
        }
        case Action.UPDATE_PIPELINE_ENDPOINT_NAME: {
            return {
                ...state,
                endpointName: action.payload.endpointName
            }
        }        
        case Action.UPDATE_PIPELINE_ENDPOINT_INSTANCE_TYPE: {
            return {
                ...state,
                endpointInstanceType: action.payload.endpointInstanceType
            }
        }
        case Action.UPDATE_PIPELINE_ENDPOINT_ACCELERATOR_TYPE: {
            return {
                ...state,
                endpointAcceleratorType: action.payload.endpointAcceleratorType
            }
        }
        case Action.UPDATE_PIPELINE_ENDPOINT_INITIAl_INSTANCE_TYPE: {
            return {
                ...state,
                endpointInitialInstanceCount: action.payload.endpointInitialInstanceCount
            }
        }
        case Action.UPDATE_PIPELINE_ENDPOINT_INITIAL_VARIANT_WEIGHT: {
            return {
                ...state,
                endpointInitialVariantWeight: action.payload.endpointInitialVariantWeight
            }
        }
        case Action.UPDATE_PIPELINE_GREENGRASS_COMPONENT_NAME: {
            return {
                ...state,
                greengrassComponentName: action.payload.greengrassComponentName
            }
        }
        case Action.UPDATE_PIPELINE_GREENGRASS_COMPONENT_VERSION: {
            return {
                ...state,
                greengrassComponentVersion: action.payload.greengrassComponentVersion
            }
        }
        case Action.UPDATE_PIPELINE_MODEL_DATA_URL: {
            return {
                ...state,
                modelDataUrl: action.payload.modelDataUrl
            }
        }
        case Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_NAME: {
            return {
                ...state,
                greengrassDeploymentName: action.payload.greengrassDeploymentName
            }
        }
        case Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_TYPE: {
            return {
                ...state,
                greengrassDeploymentTargetType: action.payload.greengrassDeploymentTargetType
            }
        }
        case Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_TARGET_ARN: {
            return {
                ...state,
                greengrassDeploymentTargetArn: action.payload.greengrassDeploymentTargetArn
            }
        }
        case Action.UPDATE_PIPELINE_GREENGRASS_DEPLOYMENT_COMPONENTS: {
            return {
                ...state,
                greengrassDeploymentComponents: action.payload.greengrassDeploymentComponents
            }
        }
        default:
            return state;
    }
}
