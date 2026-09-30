from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MediaAsset
from app.schemas import MediaAssetOut
from typing import List

router = APIRouter(prefix="/api/media", tags=["Media"])


@router.get("/renders", response_model=List[MediaAssetOut])
def get_renders(db: Session = Depends(get_db)):
    return db.query(MediaAsset).filter(MediaAsset.asset_type == "render").all()


@router.get("/walkthrough", response_model=MediaAssetOut)
def get_walkthrough(db: Session = Depends(get_db)):
    return db.query(MediaAsset).filter(MediaAsset.asset_type == "video").first()


@router.get("/all", response_model=List[MediaAssetOut])
def get_all_media(db: Session = Depends(get_db)):
    return db.query(MediaAsset).order_by(MediaAsset.asset_type).all()
