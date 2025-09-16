import os
import uuid
from fastapi import UploadFile, HTTPException
from pathlib import Path

UPLOAD_DIR = "uploads/sponsor_logos"
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
MAX_FILE_SIZE = 5 * 1024 * 1024 

Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
MAX_IMAGE_SIZE = 5 * 1024 * 1024 
UPLOAD_DIR_DOCS = "uploads/docs"
UPLOAD_DIR_Video = "uploads/Video"

ALLOWED_DOC_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"}
ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
}
os.makedirs(UPLOAD_DIR_DOCS,exist_ok=True)
os.makedirs(UPLOAD_DIR_Video,exist_ok=True)


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
    

async def save_upload_document(upload_file: UploadFile) -> str:
    try:
        _, ext = os.path.splitext(upload_file.filename)
        ext = ext.lower()

        if ext not in ALLOWED_DOC_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type {ext} not supported")

        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR_DOCS, unique_filename)

        size = 0
        with open(file_path, "wb") as f:
            while chunk := await upload_file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_IMAGE_SIZE:
                    f.close()
                    os.remove(file_path)
                    raise HTTPException(status_code=400, detail="Document too large (max 5MB)")
                f.write(chunk)

        return f"{UPLOAD_DIR_DOCS}/{unique_filename}"
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error saving document: {str(e)}")
    

async def save_upload_video(upload_file: UploadFile) -> str:
   
    try:
        if upload_file.content_type not in ALLOWED_VIDEO_TYPES:
            raise HTTPException(status_code=400, detail="Only video files are allowed")

        _, ext = os.path.splitext(upload_file.filename)
        ext = ext.lower() or ".bin"

        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR_Video, unique_filename)

        size = 0
        with open(file_path, "wb") as f:
            while chunk := await upload_file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_IMAGE_SIZE:
                    f.close()
                    os.remove(file_path)
                    raise HTTPException(status_code=400, detail="Video too large (max 5 MB)")
                f.write(chunk)

        return f"{UPLOAD_DIR_Video}/{unique_filename}"
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Error saving video: {str(e)}")

def delete_upload_file(file_path: str):
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not delete file {file_path}: {str(e)}")