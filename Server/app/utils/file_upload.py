import os
import uuid
from fastapi import UploadFile, HTTPException
from pathlib import Path

UPLOAD_DIR = "uploads/sponsor_logos"
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
MAX_FILE_SIZE = 5 * 1024 * 1024 

Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    try:
        if upload_file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail="Only image files are allowed (JPEG, PNG, GIF, WEBP, SVG)"
            )
        
        contents = await upload_file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 5MB"
            )
        
        file_extension = upload_file.filename.split('.')[-1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return file_path
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

def delete_upload_file(file_path: str):
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not delete file {file_path}: {str(e)}")