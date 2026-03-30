"""
Configuration module for the AI Microservice.
Loads environment variables and initializes the Supabase client.
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Load .env file
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Flask config
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))

# Initialize Supabase client with service role key (bypasses RLS)
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# CLIP candidate labels for auto-tagging
CANDIDATE_LABELS = [
    "sports", "auditorium", "lab", "outdoor", "classroom",
    "crowd", "stage", "award ceremony", "coding", "hackathon",
    "dance", "music", "food", "workshop", "seminar",
    "graduation", "cultural event", "competition", "group photo",
    "nature", "building", "night event", "celebration", "poster",
    "portrait", "single person", "group of people", "students", 
    "faculty", "selfie", "presentation"
]

# Duplicate detection threshold (hamming distance)
# Lower = stricter matching. 10 means >90% similar = duplicate
DUPLICATE_THRESHOLD = 10
