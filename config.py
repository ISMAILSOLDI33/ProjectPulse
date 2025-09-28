# backend/config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'  # Un-comment and set
    SQLALCHEMY_DATABASE_URI = 'sqlite:///task_manager.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False