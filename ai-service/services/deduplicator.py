"""
Duplicate Detection Service
----------------------------
Uses Perceptual Hashing (pHash) to detect duplicate/near-duplicate images.

How it works:
1. Generate a "visual fingerprint" (hash) of the uploaded image
2. Compare that hash to ALL existing hashes in the database
3. If the "Hamming distance" (number of different bits) is below our threshold,
   the images are considered duplicates (>90% visually similar)

This catches duplicates even if:
  - The file was renamed
  - The image was slightly cropped
  - The quality/compression was changed
  - Minor color adjustments were made

This is FREE because imagehash is a tiny open-source library.
"""
from PIL import Image
import imagehash
from config import supabase, DUPLICATE_THRESHOLD


def generate_hash(image: Image.Image) -> str:
    """
    Generate a perceptual hash (pHash) for an image.
    
    Args:
        image: A PIL Image object
        
    Returns:
        A hex string representing the image's visual fingerprint
    """
    phash = imagehash.phash(image)
    hash_str = str(phash)
    print(f"[AI] Perception hash generated: {hash_str}")
    return hash_str


def check_duplicate(new_hash: str, exclude_media_id: str = None) -> dict:
    """
    Compare a new image's hash against ALL existing hashes in the database.
    
    Args:
        new_hash: The pHash string of the newly uploaded image
        exclude_media_id: Optional media ID to exclude from comparison (the image itself)
        
    Returns:
        {
            "is_duplicate": True/False,
            "matching_id": "uuid-of-duplicate" or None,
            "distance": int (hamming distance)
        }
    """
    # Fetch all existing hashes from the database
    query = supabase.table("media").select("id, perception_hash").not_.is_("perception_hash", "null")
    
    if exclude_media_id:
        query = query.neq("id", exclude_media_id)
    
    result = query.execute()
    
    if not result.data:
        return {"is_duplicate": False, "matching_id": None, "distance": None}
    
    # Convert the new hash back to an imagehash object for comparison
    new_hash_obj = imagehash.hex_to_hash(new_hash)
    
    for row in result.data:
        existing_hash = row.get("perception_hash")
        if not existing_hash:
            continue
        
        try:
            existing_hash_obj = imagehash.hex_to_hash(existing_hash)
            distance = new_hash_obj - existing_hash_obj  # Hamming distance
            
            if distance < DUPLICATE_THRESHOLD:
                print(f"[AI] ⚠ DUPLICATE DETECTED! Distance={distance} (threshold={DUPLICATE_THRESHOLD})")
                print(f"[AI]   Matches existing media: {row['id']}")
                return {
                    "is_duplicate": True,
                    "matching_id": row["id"],
                    "distance": distance
                }
        except Exception:
            continue
    
    print(f"[AI] ✓ No duplicates found")
    return {"is_duplicate": False, "matching_id": None, "distance": None}
