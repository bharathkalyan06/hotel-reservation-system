import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///hotel.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# initialize extensions
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

with app.app_context():
    # Import models to ensure tables are created
    import models
    db.create_all()
    
    # Create default admin user and sample rooms
    from models import User, Room
    from werkzeug.security import generate_password_hash
    
    # Create admin user if doesn't exist
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@hotel.com',
            password_hash=generate_password_hash('admin123'),
            first_name='Admin',
            last_name='User',
            phone='555-123-4567',
            is_admin=True
        )
        db.session.add(admin)
    
    # Create sample rooms if none exist
    if Room.query.count() == 0:
        rooms = [
            Room(room_number='101', room_type='Standard', price=100.0, capacity=2, description='Comfortable standard room with city view'),
            Room(room_number='102', room_type='Standard', price=100.0, capacity=2, description='Comfortable standard room with city view'),
            Room(room_number='201', room_type='Deluxe', price=150.0, capacity=3, description='Spacious deluxe room with premium amenities'),
            Room(room_number='202', room_type='Deluxe', price=150.0, capacity=3, description='Spacious deluxe room with premium amenities'),
            Room(room_number='301', room_type='Suite', price=250.0, capacity=4, description='Luxury suite with separate living area'),
            Room(room_number='302', room_type='Suite', price=250.0, capacity=4, description='Luxury suite with separate living area'),
        ]
        for room in rooms:
            db.session.add(room)
    
    db.session.commit()

# Import routes
import routes
