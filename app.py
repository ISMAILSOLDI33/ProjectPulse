# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, User
from routes import init_routes
import jwt 
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from routes import init_routes

# backend/app.py

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)
init_routes(app)


# Update token_required to use JWT_SECRET_KEY
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing!"}), 403
        try:
            # Extract token from "Bearer <token>" format
            if token.startswith("Bearer "):
                token = token[7:]  # Remove "Bearer " prefix
            data = jwt.decode(token, app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except Exception:
            return jsonify({"message": "Invalid token!"}), 403
        return f(*args, **kwargs)
    return decorated

# Update login route to use JWT_SECRET_KEY
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode({
        "id": user.id,
        "username": user.username,
        "is_admin": user.is_admin,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, app.config["JWT_SECRET_KEY"], algorithm="HS256")

    return jsonify({"token": token, "user": {"id": user.id, "username": user.username, "is_admin": user.is_admin}})


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.user.get("is_admin"):
            return jsonify({"message": "Admins only!"}), 403
        return f(*args, **kwargs)
    return decorated


# app.py (add this route)
@app.route('/test-token', methods=['GET'])
def test_token():
    token = request.headers.get('Authorization')
    return jsonify({'received_token': token}), 200
# Auth Route

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password, is_admin=False)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/verify-token", methods=["GET"])
@token_required
def verify_token():
    return jsonify({"user": request.user})


@app.route("/logout", methods=["POST"])
@token_required
def logout():
    return jsonify({"message": "Logged out successfully"}), 200

#  Protected Routes

@app.route("/admindashboard", methods=["GET"])
@token_required
@admin_required
def admin_dashboard():
    return jsonify({"message": f"Welcome Admin {request.user['username']}!"})


@app.route("/memberdashboard", methods=["GET"])
@token_required
def member_dashboard():
    return jsonify({"message": f"Welcome {request.user['username']}!"})


if __name__ == '__main__':
    app.run(debug=True, port=5000)