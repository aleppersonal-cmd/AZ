from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Form, Depends, Query
from fastapi.responses import JSONResponse, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
import secrets
import mimetypes
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import base64
import re

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_ALGORITHM = "HS256"

# File configuration
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'svg', 'zip', 'gif', 'webp'
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[àáâãäå]', 'a', text)
    text = re.sub(r'[èéêë]', 'e', text)
    text = re.sub(r'[ìíîï]', 'i', text)
    text = re.sub(r'[òóôõö]', 'o', text)
    text = re.sub(r'[ùúûü]', 'u', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def get_file_extension(filename: str) -> str:
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return ''

def validate_file(filename: str, content_length: int) -> tuple:
    """Validate file extension and size"""
    ext = get_file_extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Formato file non consentito. Formati ammessi: {', '.join(ALLOWED_EXTENSIONS)}"
    if content_length > MAX_FILE_SIZE:
        return False, f"File troppo grande. Dimensione massima: {MAX_FILE_SIZE // (1024*1024)}MB"
    return True, ""

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Create the main app
app = FastAPI(title="AZ Riscossione Tributi API")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth")
cms_router = APIRouter(prefix="/api/cms")
public_router = APIRouter(prefix="/api/public")
media_router = APIRouter(prefix="/api/media")

# ============== PYDANTIC MODELS ==============

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "editor"

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class PageCreate(BaseModel):
    slug: str
    title: str
    content: str
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    published: bool = True

class PageUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    published: Optional[bool] = None

class ServiceCreate(BaseModel):
    name: str
    slug: str
    description: str
    content: Optional[str] = None  # Rich HTML content
    icon: str
    order: int = 0
    published: bool = True
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None  # Rich HTML content
    icon: Optional[str] = None
    order: Optional[int] = None
    published: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class OnlineServiceCreate(BaseModel):
    name: str
    slug: str
    description: str
    icon: str
    url: Optional[str] = None
    order: int = 0
    published: bool = True

class MunicipalityCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    order: int = 0
    published: bool = True

class MunicipalityUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    published: Optional[bool] = None

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    privacy_accepted: bool

class JobApplication(BaseModel):
    name: str
    surname: str
    email: EmailStr
    phone: str
    message: Optional[str] = None
    privacy_accepted: bool

class SiteSettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    pec: Optional[str] = None
    working_hours: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    privacy_policy: Optional[str] = None
    cookie_policy: Optional[str] = None

# Media Manager Models
class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[str] = None

class FolderUpdate(BaseModel):
    name: Optional[str] = None

class MediaUpdate(BaseModel):
    filename: Optional[str] = None
    folder_id: Optional[str] = None

# Modulistica Models
class ModulisticaCategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    order: int = 0

class ModulisticaCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class ModulisticaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: str
    media_id: str
    published: bool = True
    order: int = 0

class ModulisticaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    media_id: Optional[str] = None
    published: Optional[bool] = None
    order: Optional[int] = None

# ============== AUTH ENDPOINTS ==============

@auth_router.post("/login")
async def login(data: UserLogin):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(str(user["_id"]), email)
    refresh_token = create_refresh_token(str(user["_id"]))
    
    response = JSONResponse(content={
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    })
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return response

@auth_router.post("/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return response

@auth_router.get("/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@auth_router.post("/refresh")
async def refresh_token(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access_token = create_access_token(str(user["_id"]), user["email"])
        response = JSONResponse(content={"message": "Token refreshed"})
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return response
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ============== CMS ENDPOINTS ==============

# --- Users Management ---
@cms_router.get("/users")
async def get_users(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    users = await db.users.find({}, {"password_hash": 0}).to_list(100)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@cms_router.post("/users")
async def create_user(data: UserCreate, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed = hash_password(data.password)
    doc = {
        "email": data.email.lower(),
        "password_hash": hashed,
        "name": data.name,
        "role": data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(doc)
    return {"id": str(result.inserted_id), "email": doc["email"], "name": doc["name"], "role": doc["role"]}

@cms_router.delete("/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    if user_id == user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# --- Pages Management ---
@cms_router.get("/pages")
async def get_pages(request: Request):
    await get_current_user(request)
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    return pages

@cms_router.post("/pages")
async def create_page(data: PageCreate, request: Request):
    await get_current_user(request)
    existing = await db.pages.find_one({"slug": data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.pages.insert_one(doc)
    del doc["_id"]
    return doc

@cms_router.put("/pages/{slug}")
async def update_page(slug: str, data: PageUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.pages.update_one({"slug": slug}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    return page

@cms_router.delete("/pages/{slug}")
async def delete_page(slug: str, request: Request):
    await get_current_user(request)
    result = await db.pages.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted"}

# --- Services Management ---
@cms_router.get("/services")
async def get_services(request: Request):
    await get_current_user(request)
    services = await db.services.find({}, {"_id": 0}).to_list(100)
    return sorted(services, key=lambda x: x.get("order", 0))

@cms_router.post("/services")
async def create_service(data: ServiceCreate, request: Request):
    await get_current_user(request)
    existing = await db.services.find_one({"slug": data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.services.insert_one(doc)
    del doc["_id"]
    return doc

@cms_router.put("/services/{slug}")
async def update_service(slug: str, data: ServiceUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.services.update_one({"slug": slug}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    service = await db.services.find_one({"slug": slug}, {"_id": 0})
    return service

@cms_router.delete("/services/{slug}")
async def delete_service(slug: str, request: Request):
    await get_current_user(request)
    result = await db.services.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# --- Online Services Management ---
@cms_router.get("/online-services")
async def get_online_services(request: Request):
    await get_current_user(request)
    services = await db.online_services.find({}, {"_id": 0}).to_list(100)
    return sorted(services, key=lambda x: x.get("order", 0))

@cms_router.post("/online-services")
async def create_online_service(data: OnlineServiceCreate, request: Request):
    await get_current_user(request)
    existing = await db.online_services.find_one({"slug": data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.online_services.insert_one(doc)
    del doc["_id"]
    return doc

@cms_router.put("/online-services/{slug}")
async def update_online_service(slug: str, data: ServiceUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.online_services.update_one({"slug": slug}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    service = await db.online_services.find_one({"slug": slug}, {"_id": 0})
    return service

@cms_router.delete("/online-services/{slug}")
async def delete_online_service(slug: str, request: Request):
    await get_current_user(request)
    result = await db.online_services.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# --- Municipalities Management ---
@cms_router.get("/municipalities")
async def get_municipalities(request: Request):
    await get_current_user(request)
    municipalities = await db.municipalities.find({}, {"_id": 0}).to_list(100)
    return sorted(municipalities, key=lambda x: x.get("order", 0))

@cms_router.post("/municipalities")
async def create_municipality(data: MunicipalityCreate, request: Request):
    await get_current_user(request)
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.municipalities.insert_one(doc)
    del doc["_id"]
    return doc

@cms_router.put("/municipalities/{municipality_id}")
async def update_municipality(municipality_id: str, data: MunicipalityUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.municipalities.update_one({"id": municipality_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Municipality not found")
    municipality = await db.municipalities.find_one({"id": municipality_id}, {"_id": 0})
    return municipality

@cms_router.delete("/municipalities/{municipality_id}")
async def delete_municipality(municipality_id: str, request: Request):
    await get_current_user(request)
    result = await db.municipalities.delete_one({"id": municipality_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return {"message": "Municipality deleted"}

# --- Contact Messages ---
@cms_router.get("/contact-messages")
async def get_contact_messages(request: Request):
    await get_current_user(request)
    messages = await db.contact_messages.find({}, {"_id": 0}).to_list(100)
    return sorted(messages, key=lambda x: x.get("created_at", ""), reverse=True)

@cms_router.delete("/contact-messages/{message_id}")
async def delete_contact_message(message_id: str, request: Request):
    await get_current_user(request)
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}

# --- Job Applications ---
@cms_router.get("/job-applications")
async def get_job_applications(request: Request):
    await get_current_user(request)
    applications = await db.job_applications.find({}, {"_id": 0}).to_list(100)
    return sorted(applications, key=lambda x: x.get("created_at", ""), reverse=True)

@cms_router.delete("/job-applications/{application_id}")
async def delete_job_application(application_id: str, request: Request):
    await get_current_user(request)
    result = await db.job_applications.delete_one({"id": application_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}

# --- Site Settings ---
@cms_router.get("/settings")
async def get_settings(request: Request):
    await get_current_user(request)
    settings = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    return settings or {}

@cms_router.put("/settings")
async def update_settings(data: SiteSettingsUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.site_settings.update_one({"id": "main"}, {"$set": update_data}, upsert=True)
    settings = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    return settings

# ============== MEDIA MANAGER ENDPOINTS ==============

# --- Folders Management ---
@cms_router.get("/folders")
async def get_folders(request: Request):
    await get_current_user(request)
    folders = await db.media_folders.find({}, {"_id": 0}).to_list(100)
    return sorted(folders, key=lambda x: x.get("name", ""))

@cms_router.post("/folders")
async def create_folder(data: FolderCreate, request: Request):
    await get_current_user(request)
    # Check if folder with same name exists in same parent
    existing = await db.media_folders.find_one({
        "name": data.name,
        "parent_id": data.parent_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Cartella con questo nome già esistente")
    
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "slug": slugify(data.name),
        "parent_id": data.parent_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.media_folders.insert_one(doc)
    del doc["_id"]
    return doc

@cms_router.put("/folders/{folder_id}")
async def update_folder(folder_id: str, data: FolderUpdate, request: Request):
    await get_current_user(request)
    update_data = {}
    if data.name:
        update_data["name"] = data.name
        update_data["slug"] = slugify(data.name)
    
    result = await db.media_folders.update_one({"id": folder_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")
    folder = await db.media_folders.find_one({"id": folder_id}, {"_id": 0})
    return folder

@cms_router.delete("/folders/{folder_id}")
async def delete_folder(folder_id: str, request: Request):
    await get_current_user(request)
    # Check if folder has files
    files_count = await db.media_files.count_documents({"folder_id": folder_id})
    if files_count > 0:
        raise HTTPException(status_code=400, detail="La cartella contiene file. Elimina prima i file.")
    # Check if folder has subfolders
    subfolders = await db.media_folders.count_documents({"parent_id": folder_id})
    if subfolders > 0:
        raise HTTPException(status_code=400, detail="La cartella contiene sottocartelle. Elimina prima le sottocartelle.")
    
    result = await db.media_folders.delete_one({"id": folder_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")
    return {"message": "Folder deleted"}

# --- Media Files Management ---
@cms_router.get("/media")
async def list_media(
    request: Request,
    folder_id: Optional[str] = None,
    search: Optional[str] = None,
    file_type: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc"
):
    await get_current_user(request)
    
    query = {}
    if folder_id:
        query["folder_id"] = folder_id
    if search:
        query["filename"] = {"$regex": search, "$options": "i"}
    if file_type:
        query["file_type"] = file_type
    
    media_list = await db.media_files.find(query, {"_id": 0, "data": 0}).to_list(500)
    
    # Sort
    reverse = sort_order == "desc"
    if sort_by == "created_at":
        media_list = sorted(media_list, key=lambda x: x.get("created_at", ""), reverse=reverse)
    elif sort_by == "filename":
        media_list = sorted(media_list, key=lambda x: x.get("filename", "").lower(), reverse=reverse)
    elif sort_by == "size":
        media_list = sorted(media_list, key=lambda x: x.get("size", 0), reverse=reverse)
    elif sort_by == "file_type":
        media_list = sorted(media_list, key=lambda x: x.get("file_type", ""), reverse=reverse)
    
    return media_list

@cms_router.post("/media/upload")
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    folder_id: Optional[str] = Form(None)
):
    await get_current_user(request)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Validate file
    is_valid, error_msg = validate_file(file.filename, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Get file extension and type
    ext = get_file_extension(file.filename)
    file_type = ext.upper()
    
    # Encode to base64
    encoded = base64.b64encode(content).decode("utf-8")
    
    # Create unique ID and stable URL slug
    file_id = str(uuid.uuid4())
    url_slug = f"{slugify(file.filename.rsplit('.', 1)[0])}-{file_id[:8]}"
    
    doc = {
        "id": file_id,
        "filename": file.filename,
        "original_filename": file.filename,
        "url_slug": url_slug,
        "content_type": file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream",
        "file_type": file_type,
        "size": file_size,
        "folder_id": folder_id,
        "data": encoded,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.media_files.insert_one(doc)
    
    # Return without data
    return {
        "id": doc["id"],
        "filename": doc["filename"],
        "url_slug": doc["url_slug"],
        "content_type": doc["content_type"],
        "file_type": doc["file_type"],
        "size": doc["size"],
        "folder_id": doc["folder_id"],
        "url": f"/api/media/file/{doc['url_slug']}",
        "created_at": doc["created_at"]
    }

@cms_router.post("/media/upload-multiple")
async def upload_multiple_media(
    request: Request,
    files: List[UploadFile] = File(...),
    folder_id: Optional[str] = Form(None)
):
    await get_current_user(request)
    
    results = []
    errors = []
    
    for file in files:
        try:
            content = await file.read()
            file_size = len(content)
            
            is_valid, error_msg = validate_file(file.filename, file_size)
            if not is_valid:
                errors.append({"filename": file.filename, "error": error_msg})
                continue
            
            ext = get_file_extension(file.filename)
            file_type = ext.upper()
            encoded = base64.b64encode(content).decode("utf-8")
            
            file_id = str(uuid.uuid4())
            url_slug = f"{slugify(file.filename.rsplit('.', 1)[0])}-{file_id[:8]}"
            
            doc = {
                "id": file_id,
                "filename": file.filename,
                "original_filename": file.filename,
                "url_slug": url_slug,
                "content_type": file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream",
                "file_type": file_type,
                "size": file_size,
                "folder_id": folder_id,
                "data": encoded,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.media_files.insert_one(doc)
            
            results.append({
                "id": doc["id"],
                "filename": doc["filename"],
                "url_slug": doc["url_slug"],
                "file_type": doc["file_type"],
                "size": doc["size"],
                "url": f"/api/media/file/{doc['url_slug']}",
                "created_at": doc["created_at"]
            })
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})
    
    return {"uploaded": results, "errors": errors}

@cms_router.put("/media/{media_id}")
async def update_media(media_id: str, data: MediaUpdate, request: Request):
    await get_current_user(request)
    
    update_data = {}
    if data.filename:
        update_data["filename"] = data.filename
    if data.folder_id is not None:
        update_data["folder_id"] = data.folder_id if data.folder_id else None
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.media_files.update_one({"id": media_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    
    media = await db.media_files.find_one({"id": media_id}, {"_id": 0, "data": 0})
    media["url"] = f"/api/media/file/{media['url_slug']}"
    return media

@cms_router.put("/media/{media_id}/replace")
async def replace_media(
    media_id: str,
    request: Request,
    file: UploadFile = File(...)
):
    """Replace file content while keeping the same URL"""
    await get_current_user(request)
    
    # Check if media exists
    existing = await db.media_files.find_one({"id": media_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Read and validate new file
    content = await file.read()
    file_size = len(content)
    
    is_valid, error_msg = validate_file(file.filename, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    ext = get_file_extension(file.filename)
    file_type = ext.upper()
    encoded = base64.b64encode(content).decode("utf-8")
    
    # Update file data while keeping URL slug
    update_data = {
        "filename": file.filename,
        "content_type": file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream",
        "file_type": file_type,
        "size": file_size,
        "data": encoded,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.media_files.update_one({"id": media_id}, {"$set": update_data})
    
    media = await db.media_files.find_one({"id": media_id}, {"_id": 0, "data": 0})
    media["url"] = f"/api/media/file/{media['url_slug']}"
    return media

@cms_router.delete("/media/{media_id}")
async def delete_media(media_id: str, request: Request):
    await get_current_user(request)
    
    # Check if media is used in modulistica
    modulistica_count = await db.modulistica.count_documents({"media_id": media_id})
    if modulistica_count > 0:
        raise HTTPException(status_code=400, detail="File utilizzato nella modulistica. Rimuovi prima il riferimento.")
    
    result = await db.media_files.delete_one({"id": media_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"message": "Media deleted"}

# --- Public Media Access ---
@media_router.get("/file/{url_slug}")
async def get_media_file(url_slug: str):
    """Public endpoint to serve media files"""
    media = await db.media_files.find_one({"url_slug": url_slug})
    if not media:
        raise HTTPException(status_code=404, detail="File not found")
    
    content = base64.b64decode(media["data"])
    
    return Response(
        content=content,
        media_type=media["content_type"],
        headers={
            "Content-Disposition": f'inline; filename="{media["filename"]}"',
            "Cache-Control": "public, max-age=31536000"
        }
    )

@media_router.get("/download/{url_slug}")
async def download_media_file(url_slug: str):
    """Public endpoint to download media files"""
    media = await db.media_files.find_one({"url_slug": url_slug})
    if not media:
        raise HTTPException(status_code=404, detail="File not found")
    
    content = base64.b64decode(media["data"])
    
    return Response(
        content=content,
        media_type=media["content_type"],
        headers={
            "Content-Disposition": f'attachment; filename="{media["filename"]}"',
            "Cache-Control": "public, max-age=31536000"
        }
    )

# ============== MODULISTICA ENDPOINTS ==============

# --- Categories Management ---
@cms_router.get("/modulistica-categories")
async def get_modulistica_categories(request: Request):
    await get_current_user(request)
    categories = await db.modulistica_categories.find({}, {"_id": 0}).to_list(100)
    return sorted(categories, key=lambda x: x.get("order", 0))

@cms_router.post("/modulistica-categories")
async def create_modulistica_category(data: ModulisticaCategoryCreate, request: Request):
    await get_current_user(request)
    
    slug = data.slug or slugify(data.name)
    existing = await db.modulistica_categories.find_one({"slug": slug})
    if existing:
        raise HTTPException(status_code=400, detail="Categoria con questo slug già esistente")
    
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "slug": slug,
        "description": data.description,
        "order": data.order,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.modulistica_categories.insert_one(doc)
    del doc["_id"]
    return doc

@cms_router.put("/modulistica-categories/{category_id}")
async def update_modulistica_category(category_id: str, data: ModulisticaCategoryUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.modulistica_categories.update_one({"id": category_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    category = await db.modulistica_categories.find_one({"id": category_id}, {"_id": 0})
    return category

@cms_router.delete("/modulistica-categories/{category_id}")
async def delete_modulistica_category(category_id: str, request: Request):
    await get_current_user(request)
    # Check if category has documents
    docs_count = await db.modulistica.count_documents({"category_id": category_id})
    if docs_count > 0:
        raise HTTPException(status_code=400, detail="La categoria contiene documenti. Elimina prima i documenti.")
    
    result = await db.modulistica_categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# --- Modulistica Documents Management ---
@cms_router.get("/modulistica")
async def get_modulistica(request: Request):
    await get_current_user(request)
    docs = await db.modulistica.find({}, {"_id": 0}).to_list(500)
    
    # Enrich with category and media info
    for doc in docs:
        category = await db.modulistica_categories.find_one({"id": doc.get("category_id")}, {"_id": 0})
        doc["category"] = category
        media = await db.media_files.find_one({"id": doc.get("media_id")}, {"_id": 0, "data": 0})
        if media:
            media["url"] = f"/api/media/file/{media['url_slug']}"
        doc["media"] = media
    
    return sorted(docs, key=lambda x: (x.get("category", {}).get("order", 0), x.get("order", 0)))

@cms_router.post("/modulistica")
async def create_modulistica(data: ModulisticaCreate, request: Request):
    await get_current_user(request)
    
    # Validate category exists
    category = await db.modulistica_categories.find_one({"id": data.category_id})
    if not category:
        raise HTTPException(status_code=400, detail="Categoria non trovata")
    
    # Validate media exists
    media = await db.media_files.find_one({"id": data.media_id})
    if not media:
        raise HTTPException(status_code=400, detail="File non trovato")
    
    doc = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "description": data.description,
        "category_id": data.category_id,
        "media_id": data.media_id,
        "published": data.published,
        "order": data.order,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.modulistica.insert_one(doc)
    del doc["_id"]
    
    # Add category and media info
    doc["category"] = {"id": category["id"], "name": category["name"], "slug": category["slug"]}
    doc["media"] = {
        "id": media["id"],
        "filename": media["filename"],
        "file_type": media["file_type"],
        "url": f"/api/media/file/{media['url_slug']}"
    }
    
    return doc

@cms_router.put("/modulistica/{doc_id}")
async def update_modulistica(doc_id: str, data: ModulisticaUpdate, request: Request):
    await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.modulistica.update_one({"id": doc_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = await db.modulistica.find_one({"id": doc_id}, {"_id": 0})
    
    # Add category and media info
    category = await db.modulistica_categories.find_one({"id": doc.get("category_id")}, {"_id": 0})
    doc["category"] = category
    media = await db.media_files.find_one({"id": doc.get("media_id")}, {"_id": 0, "data": 0})
    if media:
        media["url"] = f"/api/media/file/{media['url_slug']}"
    doc["media"] = media
    
    return doc

@cms_router.delete("/modulistica/{doc_id}")
async def delete_modulistica(doc_id: str, request: Request):
    await get_current_user(request)
    result = await db.modulistica.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted"}

# ============== PUBLIC ENDPOINTS ==============

@public_router.get("/settings")
async def get_public_settings():
    settings = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    return settings or {
        "company_name": "AZ Riscossione Tributi Locali S.r.l.",
        "address": "Via Imera 4B, Campofelice di Roccella (PA)",
        "phone": "0921 600348",
        "email": "info@azriscossione.it",
        "pec": "az@pec.azriscossione.it",
        "working_hours": "Lunedì - Venerdì: 9:00 - 18:00",
        "hero_title": "La nostra professionalità al vostro servizio",
        "hero_subtitle": "Società autorizzata dal Ministero dell'Economia e delle Finanze all'accertamento e alla riscossione dei Tributi Locali, iscritta al n°171 dell'albo Nazionale dei Concessionari."
    }

@public_router.get("/services")
async def get_public_services():
    services = await db.services.find({"published": True}, {"_id": 0}).to_list(100)
    return sorted(services, key=lambda x: x.get("order", 0))

@public_router.get("/services/{slug}")
async def get_public_service(slug: str):
    service = await db.services.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@public_router.get("/online-services")
async def get_public_online_services():
    services = await db.online_services.find({"published": True}, {"_id": 0}).to_list(100)
    return sorted(services, key=lambda x: x.get("order", 0))

@public_router.get("/municipalities")
async def get_public_municipalities():
    municipalities = await db.municipalities.find({"published": True}, {"_id": 0}).to_list(100)
    return sorted(municipalities, key=lambda x: x.get("order", 0))

@public_router.get("/pages/{slug}")
async def get_public_page(slug: str):
    page = await db.pages.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@public_router.get("/documents")
async def get_public_documents():
    documents = await db.documents.find({"published": True}, {"_id": 0}).to_list(100)
    return documents

@public_router.get("/documents/{category}")
async def get_public_documents_by_category(category: str):
    documents = await db.documents.find({"category": category, "published": True}, {"_id": 0}).to_list(100)
    return documents

# --- Public Modulistica Endpoints ---
@public_router.get("/modulistica")
async def get_public_modulistica(
    category: Optional[str] = None,
    search: Optional[str] = None,
    file_type: Optional[str] = None,
    sort_by: str = "order"
):
    """Public endpoint to get all published modulistica"""
    query = {"published": True}
    
    if category:
        # Find category by slug
        cat = await db.modulistica_categories.find_one({"slug": category})
        if cat:
            query["category_id"] = cat["id"]
    
    docs = await db.modulistica.find(query, {"_id": 0}).to_list(500)
    
    # Enrich with category and media info
    result = []
    for doc in docs:
        category_doc = await db.modulistica_categories.find_one({"id": doc.get("category_id")}, {"_id": 0})
        doc["category"] = category_doc
        
        media = await db.media_files.find_one({"id": doc.get("media_id")}, {"_id": 0, "data": 0})
        if media:
            media["url"] = f"/api/media/file/{media['url_slug']}"
            media["download_url"] = f"/api/media/download/{media['url_slug']}"
            doc["media"] = media
            
            # Filter by file type if specified
            if file_type and media.get("file_type", "").upper() != file_type.upper():
                continue
            
            # Filter by search term
            if search:
                search_lower = search.lower()
                if (search_lower not in doc.get("title", "").lower() and 
                    search_lower not in (doc.get("description") or "").lower() and
                    search_lower not in (category_doc.get("name") if category_doc else "").lower()):
                    continue
            
            result.append(doc)
    
    # Sort
    if sort_by == "name":
        result = sorted(result, key=lambda x: x.get("title", "").lower())
    elif sort_by == "category":
        result = sorted(result, key=lambda x: (x.get("category", {}).get("order", 0), x.get("order", 0)))
    elif sort_by == "date":
        result = sorted(result, key=lambda x: x.get("created_at", ""), reverse=True)
    else:  # order
        result = sorted(result, key=lambda x: (x.get("category", {}).get("order", 0), x.get("order", 0)))
    
    return result

@public_router.get("/modulistica-categories")
async def get_public_modulistica_categories():
    """Public endpoint to get all modulistica categories with document count"""
    categories = await db.modulistica_categories.find({}, {"_id": 0}).to_list(100)
    
    # Add document count for each category
    for cat in categories:
        count = await db.modulistica.count_documents({"category_id": cat["id"], "published": True})
        cat["document_count"] = count
    
    return sorted(categories, key=lambda x: x.get("order", 0))

@public_router.post("/contact")
async def submit_contact(data: ContactMessage):
    if not data.privacy_accepted:
        raise HTTPException(status_code=400, detail="Privacy policy must be accepted")
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["read"] = False
    await db.contact_messages.insert_one(doc)
    return {"message": "Message sent successfully", "id": doc["id"]}

@public_router.post("/job-application")
async def submit_job_application(
    name: str = Form(...),
    surname: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    message: str = Form(None),
    privacy_accepted: bool = Form(...),
    cv: UploadFile = File(...)
):
    if not privacy_accepted:
        raise HTTPException(status_code=400, detail="Privacy policy must be accepted")
    
    # Save CV
    cv_content = await cv.read()
    cv_encoded = base64.b64encode(cv_content).decode("utf-8")
    cv_doc = {
        "id": str(uuid.uuid4()),
        "filename": cv.filename,
        "content_type": cv.content_type,
        "data": cv_encoded,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.media.insert_one(cv_doc)
    
    # Save application
    doc = {
        "id": str(uuid.uuid4()),
        "name": name,
        "surname": surname,
        "email": email,
        "phone": phone,
        "message": message,
        "cv_id": cv_doc["id"],
        "cv_filename": cv.filename,
        "privacy_accepted": privacy_accepted,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    await db.job_applications.insert_one(doc)
    return {"message": "Application submitted successfully", "id": doc["id"]}

# ============== ROOT ENDPOINT ==============

@api_router.get("/")
async def root():
    return {"message": "AZ Riscossione Tributi API", "version": "1.1.0"}

# Include routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(cms_router)
app.include_router(public_router)
app.include_router(media_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000')],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== STARTUP EVENTS ==============

@app.on_event("startup")
async def startup_event():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.pages.create_index("slug", unique=True)
    await db.services.create_index("slug", unique=True)
    await db.online_services.create_index("slug", unique=True)
    await db.media_files.create_index("url_slug", unique=True)
    await db.modulistica_categories.create_index("slug", unique=True)
    
    # Seed admin user
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@azriscossione.it")
    admin_password = os.environ.get("ADMIN_PASSWORD", "AzAdmin2024!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Amministratore",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")
    
    # Write test credentials
    Path("/app/memory").mkdir(parents=True, exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n")
        f.write(f"## Admin User\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write(f"- Role: admin\n\n")
    
    # Seed default site settings
    existing_settings = await db.site_settings.find_one({"id": "main"})
    if not existing_settings:
        await db.site_settings.insert_one({
            "id": "main",
            "company_name": "AZ Riscossione Tributi Locali S.r.l.",
            "address": "Via Imera 4B, Campofelice di Roccella (PA)",
            "phone": "0921 600348",
            "email": "info@azriscossione.it",
            "pec": "az@pec.azriscossione.it",
            "working_hours": "Lunedì - Venerdì: 9:00 - 18:00",
            "hero_title": "La nostra professionalità al vostro servizio",
            "hero_subtitle": "Società autorizzata dal Ministero dell'Economia e delle Finanze all'accertamento e alla riscossione dei Tributi Locali, iscritta al n°171 dell'albo Nazionale dei Concessionari.",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Default site settings created")
    
    # Seed default services
    default_services = [
        {"name": "ICI / IMU", "slug": "ici-imu", "description": "Gestione completa dell'Imposta Comunale sugli Immobili e dell'Imposta Municipale Unica. Supporto per dichiarazioni, calcoli e pagamenti.", "icon": "Building2", "order": 1},
        {"name": "TARSU / TARES / TARI", "slug": "tarsu-tares-tari", "description": "Gestione della Tassa sui Rifiuti Solidi Urbani in tutte le sue forme. Calcolo tariffe, emissione avvisi, gestione reclami.", "icon": "Recycle", "order": 2},
        {"name": "TOSAP", "slug": "tosap", "description": "Tassa per l'Occupazione di Spazi ed Aree Pubbliche. Rilascio autorizzazioni e gestione pagamenti.", "icon": "MapPin", "order": 3},
        {"name": "Censimento Immobili", "slug": "censimento-immobili", "description": "Attività di censimento e verifica degli immobili presenti sul territorio comunale.", "icon": "ClipboardList", "order": 4},
        {"name": "Aree Edificabili", "slug": "aree-edificabili", "description": "Gestione e valutazione delle aree edificabili ai fini dell'imposizione fiscale.", "icon": "Home", "order": 5},
        {"name": "Illuminazione Votiva", "slug": "illuminazione-votiva", "description": "Gestione del servizio di illuminazione votiva nei cimiteri comunali.", "icon": "Lightbulb", "order": 6},
        {"name": "Pubblicità", "slug": "pubblicita", "description": "Imposta comunale sulla pubblicità e diritti sulle pubbliche affissioni.", "icon": "Megaphone", "order": 7},
        {"name": "Riscossione Coattiva", "slug": "riscossione-coattiva", "description": "Procedure di riscossione coattiva per tributi non pagati entro i termini.", "icon": "Gavel", "order": 8},
        {"name": "Oneri di Urbanizzazione", "slug": "oneri-urbanizzazione", "description": "Gestione degli oneri di urbanizzazione primaria e secondaria.", "icon": "Construction", "order": 9},
        {"name": "Codice della Strada", "slug": "codice-strada", "description": "Riscossione sanzioni amministrative per violazioni al Codice della Strada.", "icon": "Car", "order": 10}
    ]
    
    for service in default_services:
        existing = await db.services.find_one({"slug": service["slug"]})
        if not existing:
            service["published"] = True
            service["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.services.insert_one(service)
    logger.info("Default services seeded")
    
    # Seed default online services
    default_online_services = [
        {"name": "Portale degli Enti", "slug": "portale-enti", "description": "Area riservata agli Enti convenzionati per la consultazione e gestione dei servizi.", "icon": "Landmark", "order": 1},
        {"name": "Portale dei Contribuenti", "slug": "portale-contribuenti", "description": "Area dedicata ai cittadini per consultare la propria posizione tributaria e scaricare modulistica.", "icon": "Users", "order": 2},
        {"name": "Portale Pagamento Imposte", "slug": "portale-pagamenti", "description": "Sistema di pagamento online sicuro per il versamento dei tributi.", "icon": "CreditCard", "order": 3},
        {"name": "Portale Operatori AZ", "slug": "portale-operatori", "description": "Area riservata agli operatori AZ Riscossione per la gestione delle pratiche.", "icon": "Briefcase", "order": 4}
    ]
    
    for service in default_online_services:
        existing = await db.online_services.find_one({"slug": service["slug"]})
        if not existing:
            service["published"] = True
            service["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.online_services.insert_one(service)
    logger.info("Default online services seeded")
    
    # Seed default pages
    default_pages = [
        {"slug": "chi-siamo", "title": "Chi Siamo", "content": "<p>AZ Riscossione Tributi Locali S.r.l. è una società autorizzata dal Ministero dell'Economia e delle Finanze all'accertamento e alla riscossione dei Tributi Locali, iscritta al n°171 dell'albo Nazionale dei Concessionari.</p><p>Con anni di esperienza nel settore, offriamo ai Comuni un servizio completo e professionale per la gestione delle entrate tributarie.</p>"},
        {"slug": "az-ricerca-sviluppo", "title": "AZ Ricerca e Sviluppo", "content": "<p>Il nostro reparto Ricerca e Sviluppo lavora costantemente per migliorare i processi e sviluppare soluzioni tecnologiche innovative per la gestione dei tributi locali.</p>"},
        {"slug": "az-per-il-sociale", "title": "AZ per il Sociale", "content": "<p>AZ Riscossione è impegnata in numerose iniziative sociali sul territorio, sostenendo progetti di solidarietà e sviluppo della comunità.</p>"},
        {"slug": "az-per-la-qualita", "title": "AZ per la Qualità", "content": "<p>La qualità è al centro del nostro lavoro. Siamo certificati secondo gli standard internazionali e lavoriamo per il miglioramento continuo dei nostri servizi.</p>"},
        {"slug": "az-formazione", "title": "AZ Formazione", "content": "<p>Investiamo nella formazione continua del nostro personale e offriamo percorsi formativi agli Enti convenzionati.</p>"},
        {"slug": "lavora-con-noi", "title": "Lavora con Noi", "content": "<p>Vuoi far parte del nostro team? Inviaci la tua candidatura compilando il modulo sottostante.</p>"},
        {"slug": "privacy-policy", "title": "Privacy Policy", "content": "<h2>Informativa sulla Privacy</h2><p>Ai sensi del Regolamento UE 2016/679 (GDPR), questa pagina descrive le modalità di gestione del sito in riferimento al trattamento dei dati personali degli utenti.</p><h3>Titolare del Trattamento</h3><p>AZ Riscossione Tributi Locali S.r.l. - Via Imera 4B, Campofelice di Roccella (PA)</p><h3>Tipologia di Dati Raccolti</h3><p>I dati personali raccolti includono: nome, cognome, email, telefono, e altri dati forniti volontariamente dall'utente attraverso i moduli di contatto.</p><h3>Finalità del Trattamento</h3><p>I dati sono trattati per rispondere alle richieste degli utenti e per la gestione delle candidature di lavoro.</p><h3>Diritti dell'Interessato</h3><p>L'utente ha diritto di accesso, rettifica, cancellazione e portabilità dei dati, nonché di opposizione al trattamento.</p>"},
        {"slug": "cookie-policy", "title": "Cookie Policy", "content": "<h2>Informativa sui Cookie</h2><p>Questo sito utilizza cookie tecnici necessari per il corretto funzionamento.</p><h3>Cosa sono i Cookie</h3><p>I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo dell'utente quando visita un sito web.</p><h3>Cookie Tecnici</h3><p>Questo sito utilizza cookie tecnici per garantire il corretto funzionamento del sito e per memorizzare le preferenze dell'utente (es. consenso cookie).</p><h3>Come Disabilitare i Cookie</h3><p>È possibile disabilitare i cookie attraverso le impostazioni del browser, ma questo potrebbe compromettere alcune funzionalità del sito.</p>"}
    ]
    
    for page in default_pages:
        existing = await db.pages.find_one({"slug": page["slug"]})
        if not existing:
            page["published"] = True
            page["meta_title"] = page["title"] + " | AZ Riscossione"
            page["meta_description"] = ""
            page["created_at"] = datetime.now(timezone.utc).isoformat()
            page["updated_at"] = page["created_at"]
            await db.pages.insert_one(page)
    logger.info("Default pages seeded")
    
    # Seed default media folders
    default_folders = [
        {"name": "Modulistica", "slug": "modulistica"},
        {"name": "Loghi Comuni", "slug": "loghi-comuni"},
        {"name": "Documentazione Tecnica", "slug": "documentazione-tecnica"},
        {"name": "Privacy", "slug": "privacy"},
        {"name": "Immagini Sito", "slug": "immagini-sito"}
    ]
    
    for folder in default_folders:
        existing = await db.media_folders.find_one({"slug": folder["slug"]})
        if not existing:
            folder["id"] = str(uuid.uuid4())
            folder["parent_id"] = None
            folder["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.media_folders.insert_one(folder)
    logger.info("Default media folders seeded")
    
    # Seed default modulistica categories
    default_modulistica_categories = [
        {"name": "IMU", "slug": "imu", "order": 1},
        {"name": "TARI", "slug": "tari", "order": 2},
        {"name": "TOSAP", "slug": "tosap", "order": 3},
        {"name": "Pubblicità", "slug": "pubblicita", "order": 4},
        {"name": "Riscossione Coattiva", "slug": "riscossione-coattiva", "order": 5},
        {"name": "Codice della Strada", "slug": "codice-strada", "order": 6},
        {"name": "Modulistica Generale", "slug": "modulistica-generale", "order": 7}
    ]
    
    for cat in default_modulistica_categories:
        existing = await db.modulistica_categories.find_one({"slug": cat["slug"]})
        if not existing:
            cat["id"] = str(uuid.uuid4())
            cat["description"] = None
            cat["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.modulistica_categories.insert_one(cat)
    logger.info("Default modulistica categories seeded")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
