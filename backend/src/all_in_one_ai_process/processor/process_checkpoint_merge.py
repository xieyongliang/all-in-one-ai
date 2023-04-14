import argparse
from collections import namedtuple
import os
import safetensors.torch
import torch
import pytorch_lightning

# These must match the ProcessingInput/ProcessingOutput
# when you call sagemaker processor API to run a process job.
INPUT_PATH='/opt/ml/processing/input'
OUTPUT_PATH='/opt/ml/processing/output'

CheckpointInfo = namedtuple("CheckpointInfo", ['filename', 'model_name'])

def get_checkpoint_info(checkpoint_file):
    name = os.path.basename(checkpoint_file)
    if name.startswith("\\") or name.startswith("/"):
        name = name[1:]

    model_name = os.path.splitext(name.replace("/", "_").replace("\\", "_"))[0]
    return CheckpointInfo(checkpoint_file, model_name)

def weighted_sum(theta0, theta1, alpha):
    return ((1 - alpha) * theta0) + (alpha * theta1)

def get_difference(theta1, theta2):
    return theta1 - theta2

def add_difference(theta0, theta1_2_diff, alpha):
    return theta0 + (alpha * theta1_2_diff)

chckpoint_dict_replacements = {
    'cond_stage_model.transformer.embeddings.': 'cond_stage_model.transformer.text_model.embeddings.',
    'cond_stage_model.transformer.encoder.': 'cond_stage_model.transformer.text_model.encoder.',
    'cond_stage_model.transformer.final_layer_norm.': 'cond_stage_model.transformer.text_model.final_layer_norm.',
}

def transform_checkpoint_dict_key(k):
    for text, replacement in chckpoint_dict_replacements.items():
        if k.startswith(text):
            k = replacement + k[len(text):]

    return k


def get_state_dict_from_checkpoint(pl_sd):
    pl_sd = pl_sd.pop("state_dict", pl_sd)
    pl_sd.pop("state_dict", None)

    sd = {}
    for k, v in pl_sd.items():
        new_key = transform_checkpoint_dict_key(k)

        if new_key is not None:
            sd[new_key] = v

    pl_sd.clear()
    pl_sd.update(sd)

    return pl_sd


def read_state_dict(checkpoint_file, map_location, print_global_state=False):
    _, extension = os.path.splitext(checkpoint_file)
    if extension.lower() == ".safetensors":
        pl_sd = safetensors.torch.load_file(checkpoint_file, device=map_location)
    else:
        pl_sd = torch.load(checkpoint_file, map_location=map_location)

    if print_global_state and "global_step" in pl_sd:
        print(f"Global Step: {pl_sd['global_step']}")

    sd = get_state_dict_from_checkpoint(pl_sd)
    return sd

def run_modelmerger(primary_model_info, secondary_model_info,
                    tertiary_model_info, interp_method, multiplier,
                    save_as_half, custom_name, checkpoint_format,
                    output_destination, output_name):

    result_is_inpainting_model = False

    print(f"Loading {primary_model_info.filename}...")
    theta_0 = read_state_dict(primary_model_info.filename, map_location='cpu')

    print(f"Loading {secondary_model_info.filename}...")
    theta_1 = read_state_dict(secondary_model_info.filename, map_location='cpu')

    if tertiary_model_info is not None:
        print(f"Loading {tertiary_model_info.filename}...")
        theta_2 = read_state_dict(tertiary_model_info.filename, map_location='cpu')
    else:
        theta_2 = None

    theta_funcs = {
        "Weighted sum": (None, weighted_sum),
        "Add difference": (get_difference, add_difference),
    }
    theta_func1, theta_func2 = theta_funcs[interp_method]

    print(f"Merging checkpoints using {interp_method}...")

    if theta_func1:
        for key in theta_1.keys():
            if 'model' in key:
                if key in theta_2:
                    t2 = theta_2.get(key, torch.zeros_like(theta_1[key]))
                    theta_1[key] = theta_func1(theta_1[key], t2)
                else:
                    theta_1[key] = torch.zeros_like(theta_1[key])
    del theta_2

    for key in theta_0.keys():
        if 'model' in key and key in theta_1:
            a = theta_0[key]
            b = theta_1[key]

            # this enables merging an inpainting model (A) with another one (B);
            # where normal model would have 4 channels, for latenst space, inpainting model would
            # have another 4 channels for unmasked picture's latent space, plus one channel for mask, for a total of 9
            if a.shape != b.shape and a.shape[0:1] + a.shape[2:] == b.shape[0:1] + b.shape[2:]:
                if a.shape[1] == 4 and b.shape[1] == 9:
                    raise RuntimeError("When merging inpainting model with a normal one, A must be the inpainting model.")

                assert a.shape[1] == 9 and b.shape[1] == 4, f"Bad dimensions for merged layer {key}: A={a.shape}, B={b.shape}"

                theta_0[key][:, 0:4, :, :] = theta_func2(a[:, 0:4, :, :], b, multiplier)
                result_is_inpainting_model = True
            else:
                theta_0[key] = theta_func2(a, b, multiplier)

            if save_as_half:
                theta_0[key] = theta_0[key].half()

    # I believe this part should be discarded, but I'll leave it for now until I am sure
    for key in theta_1.keys():
        if 'model' in key and key not in theta_0:
            theta_0[key] = theta_1[key]
            if save_as_half:
                theta_0[key] = theta_0[key].half()

    ckpt_dir = OUTPUT_PATH
    output_modelname = os.path.join(ckpt_dir, output_name)

    print(f"Saving to local path: {output_modelname}...")

    _, extension = os.path.splitext(output_modelname)
    if extension.lower() == ".safetensors":
        safetensors.torch.save_file(theta_0, output_modelname, metadata={"format": "pt"})
    else:
        torch.save(theta_0, output_modelname)

    print(f"Checkpoint saved to local path.")
    print(f"Checkpoint will then be uploaded to {output_destination}/{output_name}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--primary_model", type=str, required=True)
    parser.add_argument("--secondary_model", type=str, required=True)
    parser.add_argument("--tertiary_model", type=str)
    parser.add_argument("--interp_method", type=str, required=True, help='Interpolation Method')
    parser.add_argument("--multiplier", type=float, required=True, help='Multiplier(0.0 - 1.0), set to 0 to get model A')
    parser.add_argument("--save_as_half", type=bool, help='Save as float16')
    parser.add_argument("--custom_name", type=str, default='', help='Custom Name (Optional)')
    parser.add_argument("--checkpoint_format", type=str, choices=["ckpt", "safetensors"], 
                        default="ckpt", help="Checkpoint format")
    parser.add_argument("--output_destination", type=str, help='The S3URI for the merged checkpoint') 
    parser.add_argument("--output_name", type=str, help='The file name for the merged checkpoint') 
    args, _ = parser.parse_known_args()

    primary_model_info = get_checkpoint_info(f"{INPUT_PATH}/primary/{args.primary_model}")
    secondary_model_info = get_checkpoint_info(f"{INPUT_PATH}/secondary/{args.secondary_model}")
    tertiary_model_info = get_checkpoint_info(f"{INPUT_PATH}/tertiary/{args.tertiary_model}") \
            if args.tertiary_model is not None else None
   
    run_modelmerger(primary_model_info, secondary_model_info, tertiary_model_info,
                    args.interp_method, args.multiplier, args.save_as_half,
                    args.custom_name, args.checkpoint_format,
                    args.output_destination, args.output_name)
