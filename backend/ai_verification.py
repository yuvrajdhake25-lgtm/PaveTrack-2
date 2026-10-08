import os
import math
import tempfile
import urllib.request
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

class VerificationSchema(BaseModel):
    angle_match_score: int
    background_match_score: int
    road_region_score: int
    repair_quality_score: int
    reasoning: str

def gps_match_score(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    R = 6371e3
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    if distance <= 5: return 100
    elif distance >= 100: return 0
    else:
        score = 100 - ((distance - 5) / 95.0) * 100
        return int(max(0, min(100, score)))

def get_local_path(image_path: str) -> str:
    """Helper to download HTTPS URLs to a temporary file for Gemini processing."""
    if image_path.startswith("http"):
        temp_fd, temp_path = tempfile.mkstemp(suffix=".jpg")
        os.close(temp_fd)
        urllib.request.urlretrieve(image_path, temp_path)
        return temp_path
    return image_path

def cleanup_temp_file(image_path: str, original_path: str):
    """Delete the temp file if we downloaded it."""
    if original_path.startswith("http") and os.path.exists(image_path):
        os.remove(image_path)

def run_gemini_verification(before_image_path: str, after_image_path: str) -> dict:
    if not client:
        return {
            "angle_match_score": 88, "background_match_score": 93,
            "road_region_score": 91, "repair_quality_score": 95,
            "reasoning": "Mocked response: Images show a matching background and the pothole appears filled."
        }

    local_before = get_local_path(before_image_path)
    local_after = get_local_path(after_image_path)

    try:
        before_file = client.files.upload(file=local_before)
        after_file = client.files.upload(file=local_after)

        prompt = (
            "You are an AI verification assistant. Compare the 'before' image (showing a pothole) "
            "and the 'after' image (showing the repaired road). Verify if they are the same location "
            "and if the repair was completed successfully. Score the angle match, background match, "
            "road region match, and repair quality on a scale of 0 to 100."
        )

        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=[before_file, after_file, prompt],
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=VerificationSchema,
                temperature=0.1
            ),
        )
        import json
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini verification error: {e}")
        return {
            "angle_match_score": 0, "background_match_score": 0,
            "road_region_score": 0, "repair_quality_score": 0,
            "reasoning": f"Error running verification: {str(e)}"
        }
    finally:
        cleanup_temp_file(local_before, before_image_path)
        cleanup_temp_file(local_after, after_image_path)

class AuthenticitySchema(BaseModel):
    is_real: bool
    confidence_score: int
    reasoning: str

def check_photo_authenticity(image_path: str) -> dict:
    if not client:
        return {"is_real": True, "confidence_score": 99, "reasoning": "Mock: No API key."}
    
    local_image = get_local_path(image_path)
    try:
        file = client.files.upload(file=local_image)
        prompt = (
            "Analyze this photograph. Is it a genuine, natural photo taken by a camera in the real world, "
            "or is it a fake/spoofed image (e.g. a photo taken of a computer screen, a printout, AI generated, "
            "or heavily edited)? Return your assessment with a confidence score (0-100) and detailed reasoning."
        )
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=[file, prompt],
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AuthenticitySchema,
                temperature=0.1
            ),
        )
        import json
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini authenticity error: {e}")
        return {"is_real": False, "confidence_score": 0, "reasoning": f"Error: {str(e)}"}
    finally:
        cleanup_temp_file(local_image, image_path)

def compute_full_verification(complaint: dict, repair_submission: dict) -> dict:
    gps_score = gps_match_score(
        complaint.get("latitude", 0), complaint.get("longitude", 0),
        repair_submission.get("latitude", 0), repair_submission.get("longitude", 0)
    )

    before_img_path = complaint.get("photo_before", "")
    after_img_path = repair_submission.get("photo_after", "")

    if before_img_path.startswith("/") and not before_img_path.startswith("http"): 
        before_img_path = before_img_path[1:]
    if after_img_path.startswith("/") and not after_img_path.startswith("http"): 
        after_img_path = after_img_path[1:]
    
    gemini_result = run_gemini_verification(before_img_path, after_img_path)

    overall_score = (
        (gps_score * 0.30) +
        (gemini_result["angle_match_score"] * 0.20) +
        (gemini_result["background_match_score"] * 0.25) +
        (gemini_result["road_region_score"] * 0.25)
    )

    overall_score = int(overall_score)
    needs_manual_review = overall_score < 75 or gps_score < 30

    return {
        "gps_match_score": gps_score,
        "angle_match_score": gemini_result["angle_match_score"],
        "background_match_score": gemini_result["background_match_score"],
        "road_region_score": gemini_result["road_region_score"],
        "overall_score": overall_score,
        "verified": not needs_manual_review,
        "needs_manual_review": needs_manual_review,
        "reasoning": gemini_result["reasoning"]
    }

