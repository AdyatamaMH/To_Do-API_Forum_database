from fastapi import FastAPI, HTTPException, Depends, Response, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import mysql.connector
import firebase_admin
from firebase_admin import credentials, auth
import json

app = FastAPI()

cred = credentials.Certificate('./l4bc-adt-todoapp-firebase-adminsdk-p3ndv-801f5fe8ac.json')
firebase_admin.initialize_app(cred)

db_config = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Labmda767',
    'database': 'todoschema'
}
connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

class Task(BaseModel):
    id: Optional[int] = None
    title: str
    status: bool = False
    user_id: str

class TaskUpdate(BaseModel):
    title: str
    status: bool

class User(BaseModel):
    email: str
    password: str

class TokenData(BaseModel):
    uid: Optional[str] = None

auth_scheme = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return TokenData(uid=decoded_token['uid'])
    except Exception as e:
        return None

@app.get("/tasks/{user_id}", response_model=List[Task])
def read_tasks(user: TokenData = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = user.uid
    cursor.execute("SELECT id, title, status, user_id FROM todoschema.tasks WHERE user_id = %s", (user_id,))
    tasks = cursor.fetchall()
    return [{"id": task[0], "title": task[1], "status": bool(task[2]), "user_id": task[3]} for task in tasks]

@app.post("/tasks/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task: Task, user: TokenData = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    cursor.execute("INSERT INTO todoschema.tasks (title, status, user_id) VALUES (%s, %s, %s)", (task.title, task.status, user.uid))
    connection.commit()
    task_id = cursor.lastrowid
    cursor.execute("SELECT id, title, status, user_id FROM todoschema.tasks WHERE id = %s", (task_id,))
    new_task = cursor.fetchone()
    return {"id": new_task[0], "title": new_task[1], "status": bool(new_task[2]), "user_id": new_task[3]}

@app.put("/tasks/toggle/{id}", response_model=Task)
def toggle_task(id: int, user: TokenData = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    cursor.execute("SELECT id, status FROM todoschema.tasks WHERE id = %s AND user_id = %s", (id, user.uid))
    todo = cursor.fetchone()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    new_status = not bool(todo[1])
    cursor.execute("UPDATE todoschema.tasks SET status = %s WHERE id = %s", (new_status, id))
    connection.commit()
    cursor.execute("SELECT id, title, status, user_id FROM todoschema.tasks WHERE id = %s", (id,))
    updated_task = cursor.fetchone()
    print(f"Task {id} updated to {new_status}")  # Add this logging
    return {"id": updated_task[0], "title": updated_task[1], "status": bool(updated_task[2]), "user_id": updated_task[3]}

@app.put("/tasks/{id}", response_model=Task)
def update_task(id: int, task: TaskUpdate, user: TokenData = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    cursor.execute("SELECT id FROM todoschema.tasks WHERE id = %s AND user_id = %s", (id, user.uid))
    existing_task = cursor.fetchone()
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")
    cursor.execute("UPDATE todoschema.tasks SET title = %s, status = %s WHERE id = %s", (task.title, task.status, id))
    connection.commit()
    cursor.execute("SELECT id, title, status, user_id FROM todoschema.tasks WHERE id = %s", (id,))
    updated_task = cursor.fetchone()
    return {"id": updated_task[0], "title": updated_task[1], "status": bool(updated_task[2]), "user_id": updated_task[3]}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, user: TokenData = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    cursor.execute("DELETE FROM todoschema.tasks WHERE id = %s AND user_id = %s", (task_id, user.uid))
    connection.commit()
    return {"ok": True}

@app.post("/login/")
async def login(user: User, response: Response):
    try:
        user_record = auth.verify_id_token(user.password)
        response.set_cookie(key="session", value=user.password, httponly=True, secure=True, samesite='Lax')
        return {"message": "User authenticated"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@app.post("/logout/")
async def logout(response: Response):
    response.delete_cookie(key="session")
    return {"message": "User logged out"}

@app.post("/preferences/")
async def save_preferences(preferences: dict, response: Response):
    response.set_cookie(key="preferences", value=json.dumps(preferences), httponly=True, secure=True, samesite='Lax')
    return {"message": "Preferences saved"}

@app.get("/preferences/")
async def get_preferences(request: Request):
    preferences = request.cookies.get("preferences")
    if preferences:
        return json.loads(preferences)
    return {"message": "No preferences found"}
