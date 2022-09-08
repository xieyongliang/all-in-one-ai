import os
import json
from keybert import KeyBERT
import jieba

def model_fn(model_dir):
    """
    Load the model for inference
    """
    
    type = os.environ['type'] if('type' in os.environ ) else 'default'
    
    if(type == 'sentence-transformer'):
        model = os.environ['model'] if('model' in os.environ ) else 'paraphrase-multilingual-MiniLM-L12-v2'
        kw_model = KeyBERT(model = model)
    elif(type == 'huggingface-transformer'):
        os.system('pip install -U transformers')
        from transformers.pipelines import pipeline

        huggingface_pipeline = os.environ['huggingface_pipeline'] if('huggingface_pipeline' in os.environ ) else 'feature-extraction'
        model = os.environ['model'] if('model' in os.environ ) else 'distilbert-base-cased'
        hf_model = pipeline(huggingface_pipeline, model = model)
        kw_model = KeyBERT(model=hf_model)
    elif(type == 'flair'):
        os.system('pip install -U flair')
        from flair.embeddings import TransformerDocumentEmbeddings
        from flair.embeddings import WordEmbeddings, DocumentPoolEmbeddings
        
        doc_embedding = os.environ['doc_embedding'] if('doc_embedding' in os.environ ) else 'roberta-base'
        word_embedding = os.environ['word_embedding'] if('word_embedding' in os.environ ) else 'crawl'
        mode = os.environ['mode'] if('mode' in os.environ ) else 'doc-embedding'

        if(mode == 'doc-embedding'):
            flair_model = TransformerDocumentEmbeddings(doc_embedding)
            kw_model = KeyBERT(model = flair_model)
        else:
            glove_embedding = WordEmbeddings(word_embedding)
            document_glove_embeddings = DocumentPoolEmbeddings([glove_embedding])
            kw_model = KeyBERT(model = document_glove_embeddings)
    elif(type == 'spacy'):
        os.system('pip install -U spacy')
        import spacy
        from thinc.api import set_gpu_allocator, require_gpu

        model = os.environ['model'] if('model' in os.environ ) else 'en_core_web_trf'
        mode = os.environ['mode'] if('mode' in os.environ ) else 'transformer'
        exclude = json.loads(os.environ['exclude']) if('exclude' in os.environ ) else ['tagger', 'parser', 'ner', 'attribute_ruler', 'lemmatizer']

        if(mode == 'non-transformer'):
            nlp = spacy.load(model, exclude = exclude)
            kw_model = KeyBERT(model = nlp)
        elif(mode == 'transformer'):
            spacy.prefer_gpu()
            nlp = spacy.load(model, exclude = exclude)
            kw_model = KeyBERT(model = nlp)
        else:
            nlp = spacy.load(model, exclude = exclude)
            set_gpu_allocator("pytorch")
            require_gpu(0)
            kw_model = KeyBERT(model = nlp)
    elif(type == 'universal-sentence-encoder'):
        os.system('pip install -U tensorflow')
        os.system('pip install -U tensorflow-hub')
        import tensorflow_hub
        
        model = os.environ['model'] if('model' in os.environ ) else 'https://tfhub.dev/google/universal-sentence-encoder/4'
        embedding_model = tensorflow_hub.load(model)
        kw_model = KeyBERT(model = embedding_model)
    elif(type == 'gensim'):
        os.system('pip install -U flair')
        import gensim.downloader as api

        model = os.environ['model'] if('model' in os.environ ) else 'fasttext-wiki-news-subwords-300'
        ft = api.load(model)
        kw_model = KeyBERT(model = ft)
    else:
        kw_model = KeyBERT()

    return kw_model


def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """
    input_data = " ".join(jieba.cut(input_data))

    keyphrase_ngram_start = int(os.environ['keyphrase_ngram_start']) if('keyphrase_ngram_start' in os.environ ) else 1
    keyphrase_ngram_end = int(os.environ['keyphrase_ngram_end']) if('keyphrase_ngram_end' in os.environ ) else 1
    stop_words = os.environ['stop_words'] if('stop_words' in os.environ ) else 'english'
    top_n = int(os.environ['top_n']) if('top_n' in os.environ ) else 5
    min_df = int(os.environ['min_df']) if('min_df' in os.environ ) else 1
    use_maxsum = (os.environ['use_maxsum'].lower() == 'true') if('use_maxsum' in os.environ ) else False
    use_mmr = (os.environ['use_mmr'].lower() == 'true') if('use_mmr' in os.environ ) else False
    diversity = float(os.environ['diversity']) if('diversity' in os.environ ) else 0.5
    nr_candidates = int(os.environ['nr_candidates']) if('nr_candidates' in os.environ ) else 20
    highlight = (os.environ['highlight'].lower() == 'true') if('highlight' in os.environ ) else False

    keywords = model.extract_keywords(
        docs = input_data,
        keyphrase_ngram_range = (keyphrase_ngram_start, keyphrase_ngram_end),
        stop_words = stop_words,
        top_n = top_n,
        min_df = min_df,
        use_maxsum = use_maxsum,
        use_mmr = use_mmr,
        diversity = diversity,
        nr_candidates = nr_candidates,
        highlight = highlight

    )
    return keywords


def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    if request_content_type == 'application/json':
        data = json.loads(request_body)
        return data['inputs']
    else:
        return request_body

    
def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """
    return json.dumps({'result': prediction}, ensure_ascii=False)
