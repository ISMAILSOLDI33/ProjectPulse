# backend/routes.py
from flask import request, jsonify
from models import db, User, Project, Task
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import joinedload
import jwt
from functools import wraps

# This function is for route protection
def init_routes(app):
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get("Authorization")
            if not token:
                return jsonify({"message": "Token is missing!"}), 403
            try:
                if token.startswith("Bearer "):
                    token = token[7:]
                data = jwt.decode(token, app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
                request.user = data
            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token expired"}), 401
            except Exception:
                return jsonify({"message": "Invalid token!"}), 403
            return f(*args, **kwargs)
        return decorated

    @app.route('/projects', methods=['POST'])
    def add_project():
        try:
            data = request.json
            if not data.get('name'):
                return jsonify(message='Project name is required'), 400

            deadline = data.get('deadline')
            if deadline:
                try:
                    deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00') if 'Z' in deadline else deadline)
                except ValueError:
                    return jsonify(message='Invalid deadline format. Use ISO format (e.g., 2025-09-24T08:09)'), 400

            new_project = Project(name=data['name'], deadline=deadline)
            db.session.add(new_project)

            if 'tasks' in data and isinstance(data['tasks'], list):
                for task_data in data['tasks']:
                    new_task = Task(
                        title=task_data.get('title', ''),
                        status=task_data.get('status', 'working on...'),
                        project=new_project
                    )
                    db.session.add(new_task)

            db.session.commit()
            return jsonify(message='Project added', project_id=new_project.id), 201
        except Exception as e:
            db.session.rollback()
            return jsonify(message=f'Server error: {str(e)}'), 500

    @app.route('/tasks', methods=['POST'])
    def add_task():
        data = request.json
        if not data.get('title') or not data.get('project_id'):
            return jsonify(message='Title and project_id are required'), 400

        new_task = Task(
            title=data['title'],
            status=data.get('status', 'working on...'),
            project_id=data['project_id'],
            user_id=data.get('user_id')
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(message='Task added', task_id=new_task.id), 201

    @app.route('/tasks/<int:task_id>', methods=['GET'])
    def get_task(task_id):
        task = Task.query.get(task_id)
        if task:
            return jsonify({
                'id': task.id,
                'title': task.title,
                'status': task.status,
                'project_id': task.project_id,
                'user_id': task.user_id,
                'completed_at': task.completed_at.isoformat() if task.completed_at else None
            })
        return jsonify(message='Task not found'), 404

    @app.route('/tasks/<int:task_id>', methods=['PUT'])
    @token_required
    def update_task(task_id):
        try:
            data = request.json
            task = Task.query.get_or_404(task_id)

            # Update title if provided
            if 'title' in data:
                if not data['title']:
                    return jsonify(message='Task title is required'), 400
                task.title = data['title']

            # Update status if provided
            if 'status' in data:
                task.status = data['status']

            # Update user_id if provided
            if 'user_id' in data:
                task.user_id = data['user_id'] if data['user_id'] else None

            db.session.commit()
            return jsonify(message=f'Task {task_id} updated successfully'), 200
        except Exception as e:
            db.session.rollback()
            return jsonify(message=f'Server error: {str(e)}'), 500

    @app.route('/tasks/<int:task_id>', methods=['DELETE'])
    def delete_task(task_id):
        task = Task.query.get(task_id)
        if task:
            db.session.delete(task)
            db.session.commit()
            return jsonify(message='Task deleted')
        return jsonify(message='Task not found'), 404

    @app.route('/projects/<int:project_id>', methods=['DELETE'])
    def delete_project(project_id):
        try:
            project = Project.query.options(joinedload(Project.tasks)).get_or_404(project_id)
            tasks = Task.query.filter_by(project_id=project_id).all()
            for task in tasks:
                db.session.delete(task)
            db.session.delete(project)
            db.session.commit()
            return jsonify(message='Project deleted')
        except Exception as e:
            db.session.rollback()
            return jsonify(message=f'Error deleting project: {str(e)}'), 500
    
    @app.route("/projects/<int:project_id>/tasks/<int:task_id>", methods=["DELETE"])
    def delete_task_from_project(project_id, task_id):
        project = Project.query.get_or_404(project_id)
        task = Task.query.get_or_404(task_id)

        if task not in project.tasks:
            return jsonify({"message": "Task does not belong to this project"}), 400

        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": f"Task {task_id} deleted from project {project_id}"}), 200

    @app.route('/projects', methods=['GET'])
    def get_projects():
        projects = Project.query.all()
        return jsonify([
            {
                'id': p.id,
                'name': p.name,
                'deadline': p.deadline.isoformat() if p.deadline else None,
                'tasks': [{'id': t.id, 'title': t.title, 'status': t.status, 'user_id': t.user_id} for t in p.tasks]
            } for p in projects
        ])

    @app.route('/tasks', methods=['GET'])
    def get_tasks():
        tasks = Task.query.all()
        return jsonify([
            {
                'id': t.id,
                'title': t.title,
                'status': t.status,
                'project_id': t.project_id,
                'user_id': t.user_id,
                'completed_at': t.completed_at.isoformat() if t.completed_at else None
            } for t in tasks
        ])

    @app.route('/users', methods=['GET'])
    def get_users():
        users = User.query.all()
        return jsonify([
            {'id': u.id, 'username': u.username, 'is_admin': u.is_admin} for u in users
        ])

    @app.route('/projects/<int:project_id>', methods=['GET'])
    def get_project(project_id):
        project = Project.query.get(project_id)
        if project:
            return jsonify({
                'id': project.id,
                'name': project.name,
                'deadline': project.deadline.isoformat() if project.deadline else None,
                'tasks': [{'id': t.id, 'title': t.title, 'status': t.status, 'user_id': t.user_id} for t in project.tasks]
            })
        return jsonify(message='Project not found'), 404

    @app.route('/projects/progress', methods=['GET'])
    def get_project_progress():
        try:
            projects = Project.query.with_entities(Project.id, Project.name).all()
            progress_data = []
            
            task_counts = db.session.query(
                Task.project_id,
                func.count(Task.id).label('total_tasks'),
                func.sum(func.cast(Task.status == 'completed', db.Integer)).label('completed_tasks')
            ).group_by(Task.project_id).all()

            task_stats = {project_id: {'total_tasks': total, 'completed_tasks': completed} 
                         for project_id, total, completed in task_counts}

            for project_id, project_name in projects:
                stats = task_stats.get(project_id, {'total_tasks': 0, 'completed_tasks': 0})
                total_tasks = stats['total_tasks']
                completed_tasks = stats['completed_tasks'] or 0
                
                if total_tasks == 0:
                    progress_data.append({
                        'project_id': project_id,
                        'project_name': project_name,
                        'total_tasks': 0,
                        'completed_tasks': 0,
                        'progress': 'No tasks'
                    })
                else:
                    progress = 'Completed' if completed_tasks == total_tasks else f'{completed_tasks}/{total_tasks}'
                    progress_data.append({
                        'project_id': project_id,
                        'project_name': project_name,
                        'total_tasks': total_tasks,
                        'completed_tasks': completed_tasks,
                        'progress': progress
                    })

            return jsonify(progress_data), 200
        except Exception as e:
            return jsonify(message=f'Server error: {str(e)}'), 500

    @app.route('/members/tasks', methods=['GET'])
    @token_required
    def get_member_tasks():
        try:
            user_id = request.user['id']
            tasks = Task.query.options(joinedload(Task.project)).filter(Task.user_id == user_id).all()
            
            if not tasks:
                return jsonify(message='No tasks found for the current user'), 404

            user = User.query.get(user_id)
            result = {
                'id': user_id,
                'name': user.username,
                'tasks': [
                    {
                        'id': task.id,
                        'title': task.title,
                        'projectId': task.project_id,
                        'projectName': task.project.name,
                        'status': task.status,
                        'deadline': task.project.deadline.isoformat() if task.project.deadline else ''
                    } for task in tasks
                ]
            }
            return jsonify(result), 200
        except Exception as e:
            return jsonify(message=f'Server error: {str(e)}'), 500

    @app.route('/tasks/<int:task_id>/complete', methods=['PUT'])
    @token_required
    def complete_task(task_id):
        try:
            user_id = request.user['id']
            task = Task.query.filter_by(id=task_id, user_id=user_id).first()
            if not task:
                return jsonify(message='Task not found or not assigned to current user'), 404

            task.status = 'completed'
            task.completed_at = datetime.utcnow()
            db.session.commit()

            return jsonify(message='Task marked as completed'), 200
        except Exception as e:
            db.session.rollback()
            return jsonify(message=f'Server error: {str(e)}'), 500

    @app.route('/members/completed-tasks', methods=['GET'])
    @token_required
    def get_completed_tasks():
        try:
            user_id = request.user['id']
            tasks = Task.query.options(joinedload(Task.project)).filter(Task.user_id == user_id, Task.status == 'completed').all()
            
            if not tasks:
                return jsonify(message='No completed tasks found for the current user'), 404

            result = [
                {
                    'projectName': task.project.name,
                    'tasks': [
                        {
                            'taskTitle': task.title,
                            'completedAt': task.completed_at.isoformat() if task.completed_at else ''
                        }
                    ]
                } for task in tasks
            ]
            return jsonify(result), 200
        except Exception as e:
            return jsonify(message=f'Server error: {str(e)}'), 500

    @app.route('/projects/<int:project_id>', methods=['PUT'])
    @token_required
    def update_project(project_id):
        try:
            data = request.json
            project = Project.query.get_or_404(project_id)

            # Update project name if provided
            if 'name' in data:
                if not data['name']:
                    return jsonify(message='Project name is required'), 400
                project.name = data['name']

            # Update deadline if provided
            if 'deadline' in data:
                if data['deadline']:
                    try:
                        deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00') if 'Z' in data['deadline'] else data['deadline'])
                        project.deadline = deadline
                    except ValueError:
                        return jsonify(message='Invalid deadline format. Use ISO format (e.g., 2025-09-24T08:09)'), 400
                else:
                    project.deadline = None

            db.session.commit()
            return jsonify(message=f'Project {project.name} updated successfully'), 200
        except Exception as e:
            db.session.rollback()
            return jsonify(message=f'Server error: {str(e)}'), 500