# backend/init_db.py
from app import app, db
from models import User, Project, Task
from werkzeug.security import generate_password_hash
import datetime

with app.app_context():
    # Drop all existing tables and recreate them (use with caution in production)
    db.drop_all()
    db.create_all()

    # Create default admin user
    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            password=generate_password_hash("securepassword123"),
            is_admin=True
        )
        db.session.add(admin)

    # Optional: Create a sample member user
    if not User.query.filter_by(username="member1").first():
        member1 = User(
            username="member1",
            password=generate_password_hash("pass123"),
            is_admin=False
        )
        db.session.add(member1)

    # Optional: Create sample projects and tasks
    if not Project.query.first():
        # Sample Project 1
        project1 = Project(
            name="Website Redesign",
            deadline=datetime.datetime(2025, 10, 1)
        )
        db.session.add(project1)

        # Tasks for Project 1
        task1 = Task(title="Design UI", status="working on...", project=project1)
        task2 = Task(title="Develop Backend", status="working on...", project=project1, user_id=2)  # Assigned to member1
        db.session.add(task1)
        db.session.add(task2)

        # Sample Project 2
        project2 = Project(
            name="Mobile App Development",
            deadline=datetime.datetime(2025, 11, 15)
        )
        db.session.add(project2)

        # Tasks for Project 2
        task3 = Task(title="Plan Features", status="completed", project=project2)
        task4 = Task(title="Build Prototype", status="working on...", project=project2)
        db.session.add(task3)
        db.session.add(task4)

    # Commit all changes to the database
    db.session.commit()
    print("Database tables initialized successfully!")
    print("Default users: admin (admin/securepassword123), member1 (member1/pass123)")
    print("Sample projects and tasks have been added.")