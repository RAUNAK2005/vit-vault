"""
CLIP Model Loader
-----------------
Loads the free, open-source CLIP model from Hugging Face ONCE at startup,
then keeps it cached in memory so every request is instant.

Model: openai/clip-vit-base-patch32  (100% free, runs on CPU)
"""
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# Global model references — loaded once, reused forever
_model = None
_processor = None
_device = "cpu"  # Use CPU (free, no GPU needed)

MODEL_NAME = "openai/clip-vit-base-patch32"


def load_model():
    """Load the CLIP model and processor into memory. Called once at server startup."""
    global _model, _processor
    
    print(f"[AI] Loading CLIP model: {MODEL_NAME}...")
    print(f"[AI] This may take 1-2 minutes on the first run (downloading ~350MB).")
    print(f"[AI] Subsequent starts will be instant (cached locally).")
    
    _model = CLIPModel.from_pretrained(MODEL_NAME)
    _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    
    _model.to(_device)
    _model.eval()  # Set to evaluation mode (no training)
    
    print(f"[AI] ✓ CLIP model loaded successfully on {_device.upper()}!")
    return _model, _processor


def get_model():
    """Get the loaded model. Loads it if not loaded yet."""
    if _model is None:
        load_model()
    return _model, _processor


def encode_image(image: Image.Image):
    """
    Convert a PIL Image to a 512-dimensional vector embedding.
    This is the mathematical "fingerprint" of what the image looks like.
    
    Args:
        image: A PIL Image object
        
    Returns:
        A list of 512 float numbers (the embedding vector)
    """
    model, processor = get_model()
    
    inputs = processor(images=image, return_tensors="pt").to(_device)
    
    with torch.no_grad():
        image_features = model.get_image_features(**inputs)
    
    # Normalize the vector (makes cosine similarity work correctly)
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    
    return image_features.squeeze().tolist()


def encode_text(text: str):
    """
    Convert a text string to a 512-dimensional vector embedding.
    Used for semantic search: user's query → vector → compare with image vectors.
    
    Args:
        text: A search query string (e.g., "people dancing on stage")
        
    Returns:
        A list of 512 float numbers (the text embedding vector)
    """
    model, processor = get_model()
    
    inputs = processor(text=[text], return_tensors="pt", padding=True).to(_device)
    
    with torch.no_grad():
        text_features = model.get_text_features(**inputs)
    
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    
    return text_features.squeeze().tolist()
