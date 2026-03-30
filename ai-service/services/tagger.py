"""
Auto-Tagger Service
-------------------
Uses CLIP zero-shot classification to automatically tag images.

How it works:
1. Takes an image and a list of candidate labels (e.g., ['sports', 'crowd', 'lab'])
2. CLIP scores how similar the image is to each label
3. Returns the top N most relevant tags

This is FREE because CLIP runs locally on your CPU.
No API calls, no cloud costs.
"""
import torch
from PIL import Image
from models.clip_model import get_model
from config import CANDIDATE_LABELS


def generate_tags(image: Image.Image, top_n: int = 5) -> list[str]:
    """
    Look at an image and automatically generate descriptive tags.
    
    Args:
        image: A PIL Image object
        top_n: How many tags to return (default: top 5)
        
    Returns:
        A list of tag strings, e.g., ['crowd', 'stage', 'night event']
    """
    model, processor = get_model()
    
    # Process both the image AND all candidate labels at once
    inputs = processor(
        text=CANDIDATE_LABELS,
        images=image,
        return_tensors="pt",
        padding=True
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get similarity scores between the image and each label
    # Shape: [1, num_labels] → squeeze to [num_labels]
    logits_per_image = outputs.logits_per_image.squeeze()
    
    # Convert raw scores to probabilities (0-100%)
    probs = logits_per_image.softmax(dim=0)
    
    # Get the top N highest-scoring labels
    top_indices = probs.argsort(descending=True)[:top_n]
    
    tags = []
    for idx in top_indices:
        label = CANDIDATE_LABELS[idx]
        confidence = probs[idx].item()
        # Only include tags with >5% confidence
        if confidence > 0.05:
            tags.append(label)
    
    print(f"[AI] Auto-tags generated: {tags}")
    return tags
