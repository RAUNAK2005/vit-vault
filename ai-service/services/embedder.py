"""
Embedding Service
-----------------
Converts images into 512-dimensional mathematical vectors using CLIP.

These vectors are stored in pgvector and enable "Semantic Search":
  - User types "people dancing on stage"
  - CLIP converts that text to a vector
  - pgvector finds images whose vectors are mathematically closest
  - Returns visually relevant images, even without matching tags!

This is FREE because CLIP runs locally on your CPU.
"""
from PIL import Image
from models.clip_model import encode_image, encode_text


def generate_embedding(image: Image.Image) -> list[float]:
    """
    Convert an image to a 512-dimensional vector embedding.
    
    Args:
        image: A PIL Image object
        
    Returns:
        A list of 512 float numbers representing the image's "meaning"
    """
    embedding = encode_image(image)
    print(f"[AI] Image embedding generated ({len(embedding)} dimensions)")
    return embedding


def generate_text_embedding(query: str) -> list[float]:
    """
    Convert a search query to a 512-dimensional vector embedding.
    Used for semantic search from the Gallery search bar.
    
    Args:
        query: A text string (e.g., "people dancing")
        
    Returns:
        A list of 512 float numbers representing the query's "meaning"
    """
    embedding = encode_text(query)
    print(f"[AI] Text embedding generated for: '{query}'")
    return embedding
