from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import List
import mysql.connector
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth

app = FastAPI()

cred = credentials.Certificate('./l4bc-adt-todoapp-firebase-adminsdk-p3ndv-801f5fe8ac.json')
firebase_admin.initialize_app(cred)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

db_config = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Labmda767',
    'database': 'todoschema'
}

connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

class Task(BaseModel):
    id: int
    title: str
    status: bool = False
    user_id: int

class User(BaseModel):
    email: str
    password: str

class TokenData(BaseModel):
    uid: str

auth_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return TokenData(uid=decoded_token['uid'])
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/tasks/{user_id}", response_model=List[Task])
def read_tasks(user: TokenData = Depends(get_current_user)):
    user_id = user.uid
    cursor.execute("SELECT id, title, status FROM todoschema.tasks WHERE user_id = %s", (user_id,))
    tasks = cursor.fetchall()
    return [{"id": task[0], "title": task[1], "status": task[2], "user_id": user_id} for task in tasks]

@app.post("/tasks/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task: Task, user: TokenData = Depends(get_current_user)):
    try:
        cursor.execute("INSERT INTO todoschema.tasks (title, user_id) VALUES (%s, %s)", (task.title, user.uid))
        connection.commit()
        return task
    except ValidationError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: Task, user: TokenData = Depends(get_current_user)):
    cursor.execute("UPDATE todoschema.tasks SET title = %s, status = %s WHERE id = %s AND user_id = %s",
                   (task.title, task.status, task_id, user.uid))
    connection.commit()
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, user: TokenData = Depends(get_current_user)):
    cursor.execute("DELETE FROM todoschema.tasks WHERE id = %s AND user_id = %s", (task_id, user.uid))
    connection.commit()
    return {"ok": True}
