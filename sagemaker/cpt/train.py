import argparse
import logging
import os
import sys
import numpy as np
from datasets import load_dataset
import transformers
from transformers import (BertTokenizer, HfArgumentParser, DataCollatorForSeq2Seq, 
                          Seq2SeqTrainer, Seq2SeqTrainingArguments, TrainerCallback)
from transformers.trainer_utils import is_main_process
from datasets import Dataset
from lib.utils import DataTrainingArguments, ModelArguments
from lib.modeling_cpt import CPTForConditionalGeneration

parser = argparse.ArgumentParser()
parser.add_argument("--model_name_or_path", default='/path/to/model', type=str)
parser.add_argument("--learning_rate", default=2e-5, type=float)
parser.add_argument("--per_device_train_batch_size", default='50', type=str)
parser.add_argument("--num_train_epochs", default='5', type=str)
parser.add_argument("--train_file", default="/path/to/train_file", type=str)
parser.add_argument("--test_file", default="/path/to/test_file", type=str)
parser.add_argument("--validation_file", default="/path/to/validation_file", type=str)
parser.add_argument("--text_column", default="text", type=str)
parser.add_argument("--summary_column", default="summary", type=str)
parser.add_argument("--output_dir", default="/path/to/output", type=str)
parser.add_argument("--val_max_target_length", default="80", type=str)
parser.add_argument("--path", default="csv", type=str)

args = parser.parse_args()
arg_dict = args.__dict__

logger = logging.getLogger(__name__)

output_dir = arg_dict['output_dir']
if not os.path.exists(output_dir):
    os.mkdir(output_dir)

args = [
    '--model_name_or_path', arg_dict['model_name_or_path'],
    '--do_train', '--do_eval', '--do_predict',
    '--train_file', arg_dict['train_file'],
    '--validation_file', arg_dict['validation_file'],
    '--test_file', arg_dict['test_file'],
    '--output_dir', output_dir,
    '--per_device_train_batch_size', arg_dict['per_device_train_batch_size'],
    '--per_device_eval_batch_size', arg_dict['per_device_train_batch_size'],
    '--overwrite_output_dir',
    '--max_source_length=512',
    '--val_max_target_length=' + arg_dict['val_max_target_length'],
    '--predict_with_generate=1',
    '--num_train_epochs', arg_dict['num_train_epochs'],
    '--save_strategy', 'no',
    '--evaluation_strategy', 'epoch',
    '--learning_rate', str(arg_dict['learning_rate']),
    '--max_test_samples', str(100)
]
parser = HfArgumentParser((ModelArguments, DataTrainingArguments, Seq2SeqTrainingArguments))
model_args, data_args, training_args = parser.parse_args_into_dataclasses(args)

datasets = {}
data_files = {}
if data_args.train_file is not None:
    data_files["train"] = data_args.train_file
if data_args.validation_file is not None:
    data_files["validation"] = data_args.validation_file
if data_args.test_file is not None:
    data_files["test"] = data_args.test_file

datasets = load_dataset(arg_dict['path'], data_files=data_files)

print ("dataset: ", datasets)

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(name)s -   %(message)s",
    datefmt="%m/%d/%Y %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger.setLevel(logging.INFO if is_main_process(training_args.local_rank) else logging.WARN)

# Log on each process the small summary:
logger.warning(
    f"Process rank: {training_args.local_rank}, device: {training_args.device}, n_gpu: {training_args.n_gpu}"
    + f"distributed training: {bool(training_args.local_rank != -1)}, 16-bits training: {training_args.fp16}"
)
# Set the verbosity to info of the Transformers logger (on main process only):
if is_main_process(training_args.local_rank):
    transformers.utils.logging.set_verbosity_info()
logger.info("Training/evaluation parameters %s", training_args)

tokenizer = BertTokenizer.from_pretrained(model_args.model_name_or_path)
model = CPTForConditionalGeneration.from_pretrained(model_args.model_name_or_path)
model.config.max_length = data_args.val_max_target_length
model.config.max_length = data_args.max_source_length

text_column = arg_dict['text_column']
summary_column = arg_dict['summary_column']
column_names = datasets["train"].column_names
max_target_length = data_args.val_max_target_length
padding = False

def preprocess_function(examples):
    inputs = examples[text_column]
    targets = examples[summary_column]
    model_inputs = tokenizer(inputs, max_length=data_args.max_source_length, padding=padding, truncation=True)
    print ("input shape: ----", len(model_inputs['input_ids'][0]))

    # Setup the tokenizer for targets
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=max_target_length, padding=padding, truncation=True)

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


if training_args.do_train:
    train_dataset = datasets["train"]
    if "train" not in datasets:
        raise ValueError("--do_train requires a train dataset")
    if data_args.max_train_samples is not None:
        train_dataset = train_dataset.select(range(data_args.max_train_samples))
    train_dataset = train_dataset.map(
        preprocess_function,
        batched=True,
        num_proc=data_args.preprocessing_num_workers,
        remove_columns=column_names,
        load_from_cache_file=not data_args.overwrite_cache,
    )

if training_args.do_eval:
    max_target_length = data_args.val_max_target_length
    if "validation" not in datasets:
        raise ValueError("--do_eval requires a validation dataset")
    eval_dataset = datasets["validation"]
    if data_args.max_val_samples is not None:
        eval_dataset = eval_dataset.select(range(data_args.max_val_samples))
    eval_dataset = eval_dataset.map(
        preprocess_function,
        batched=True,
        num_proc=data_args.preprocessing_num_workers,
        remove_columns=column_names,
        load_from_cache_file=not data_args.overwrite_cache,
    )

if training_args.do_predict:
    max_target_length = data_args.val_max_target_length
    if "test" not in datasets:
        raise ValueError("--do_predict requires a test dataset")
    test_dataset = datasets["test"]
    if data_args.max_test_samples is not None:
        test_dataset = test_dataset.select(range(data_args.max_test_samples))
    test_dataset = test_dataset.map(
        preprocess_function,
        batched=True,
        num_proc=data_args.preprocessing_num_workers,
        remove_columns=column_names,
        load_from_cache_file=not data_args.overwrite_cache,
    )

max_eval_num = 30000
if len(eval_dataset) > max_eval_num:
    eval_dataset = Dataset.from_dict(eval_dataset[:max_eval_num])
print(len(eval_dataset))

# Data collator
label_pad_token_id = -100 if data_args.ignore_pad_token_for_loss else tokenizer.pad_token_id
data_collator = DataCollatorForSeq2Seq(
    tokenizer,
    model=model,
    label_pad_token_id=label_pad_token_id,
    pad_to_multiple_of=8 if training_args.fp16 else None,
)

# Metric
from rouge import Rouge

rouge = Rouge()

def postprocess_text(preds, labels):
    preds = [pred.strip() for pred in preds]
    labels = [label.strip() for label in labels]

    while '' in preds:
        idx = preds.index('')
        preds[idx] = '。'

    return preds, labels


def compute_metrics(eval_preds):
    preds, labels = eval_preds
    if isinstance(preds, tuple):
        preds = preds[0]
    decoded_preds = tokenizer.batch_decode(preds, skip_special_tokens=True)
    if data_args.ignore_pad_token_for_loss:
        # Replace -100 in the labels as we can't decode them.
        labels = np.where(labels != -100, labels, tokenizer.pad_token_id)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)

    # Some simple post-processing
    decoded_preds, decoded_labels = postprocess_text(decoded_preds, decoded_labels)
    scores = rouge.get_scores(decoded_preds, decoded_labels, avg=True)
    for key in scores:
        scores[key] = scores[key]['f'] * 100

    result = scores

    prediction_lens = [np.count_nonzero(pred != tokenizer.pad_token_id) for pred in preds]
    result["gen_len"] = np.mean(prediction_lens)
    result = {k: round(v, 4) for k, v in result.items()}
    return result


class TestCallback(TrainerCallback):
    def on_evaluate(self, args, state, control, **kwargs):
        predictions, labels, metrics = trainer.predict(test_dataset, metric_key_prefix="predict")
        metrics['epoch'] = state.epoch
        state.log_history.append(metrics)


# Initialize our Trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset if training_args.do_train else None,
    eval_dataset=eval_dataset if training_args.do_eval else None,
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics if training_args.predict_with_generate else None,
    callbacks=[TestCallback],
)

# Training
if training_args.do_train:
    train_result = trainer.train()
    trainer.save_model()  # Saves the tokenizer too for easy upload

    metrics = train_result.metrics
    max_train_samples = (
        data_args.max_train_samples if data_args.max_train_samples is not None else len(train_dataset)
    )
    metrics["train_samples"] = min(max_train_samples, len(train_dataset))

    trainer.log_metrics("train", metrics)
    trainer.save_metrics("train", metrics)
    trainer.save_state()

if trainer.is_world_process_zero():
    if training_args.predict_with_generate:
        predictions, labels, metrics = trainer.predict(test_dataset, metric_key_prefix="predict")
        test_preds = tokenizer.batch_decode(
            predictions, skip_special_tokens=True,
        )
        test_preds = [pred.strip() for pred in test_preds]
        output_test_preds_file = os.path.join(training_args.output_dir, "test_generations.txt")
        with open(output_test_preds_file, "w", encoding='UTF-8') as writer:
            writer.write("\n".join(test_preds))
