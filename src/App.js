import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddTaskForm from './components/AddTaskForm.jsx';
import UpdateForm from './components/UpdateForm.jsx';
import ToDo from './components/ToDo.jsx';
import FullName from './components/FullName.jsx';
import TaskFilter from './components/TaskFilter.jsx';
import SignIn from './components/auth/login';
import SignUp from "./components/auth/register";
import AuthDetails from "./components/auth/authdetails";
import UserProfile from './components/UserProfile';
import { auth } from './firebase.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [toDo, setToDo] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [updateData, setUpdateData] = useState(null);
  const [fullName, setFullName] = useState('Adyatama Mahabarata');
  const [number, setNumber] = useState('2602158626');
  const [filter, setFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);
      if (user) {
        fetchTasks(user.uid);
        fetchToken();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTasks = async (userId) => {
    try {
      const token = await auth.currentUser.getIdToken(true); 
      const response = await axios.get(`http://localhost:8000/tasks/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setToDo(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const fetchToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); 
      console.log("Firebase Token:", token); 
    }
  };

  const addTask = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true); 
      await axios.post('http://localhost:8000/tasks', {
        title: newTask,
        description: '',
        completed: false,
        userId: currentUser.uid
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNewTask('');
      fetchTasks(currentUser.uid);
    } catch (err) {
      alert(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken(true); 
      await axios.delete(`http://localhost:8000/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchTasks(currentUser.uid);
    } catch (err) {
      alert(err);
    }
  };

  const markDone = async (id, status) => {
    try {
      const token = await auth.currentUser.getIdToken(true); 
      await axios.put(`http://localhost:8000/tasks/${id}`, {
        completed: !status
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchTasks(currentUser.uid);
    } catch (err) {
      alert(err);
    }
  };

  const updateTask = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);
      await axios.put(`http://localhost:8000/tasks/${updateData.id}`, {
        title: updateData.title
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUpdateData(null);
      fetchTasks(currentUser.uid);
    } catch (err) {
      alert(err);
    }
  };

  const cancelUpdate = () => {
    setUpdateData(null);
  };

  const changeTask = (e) => {
    const updatedData = { ...updateData, title: e.target.value };
    setUpdateData(updatedData);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const handleProfile = () => {
    window.location.href = '/profile';
  };

  return (
    <div className="container App">
      <br /><br />
      <h2>To Do List</h2>
      <br /><br />

      {isAuthenticated ? (
        <>
          <FullName fullName={fullName} number={number} />
          {updateData ? (
            <UpdateForm
              updateData={updateData}
              changeTask={changeTask}
              updateTask={updateTask}
              cancelUpdate={cancelUpdate}
            />
          ) : (
            <AddTaskForm newTask={newTask} setNewTask={setNewTask} addTask={addTask} />
          )}
          <TaskFilter filter={filter} setFilter={setFilter} />
          {toDo && toDo.length ? (
            <ToDo tasks={toDo} filter={filter} markDone={markDone} setUpdateData={setUpdateData} deleteTask={deleteTask} />
          ) : (
            'No Tasks...'
          )}
        </>
      ) : (
        <>
          <SignIn setIsAuthenticated={setIsAuthenticated} />
          <SignUp />
          <AuthDetails />
        </>
      )}

      {/* User Profile Component */}
      {window.location.pathname === '/profile' && <UserProfile currentUser={currentUser} />}

      {currentUser && (
        <div>
          <h2>User Profile</h2>
          <p>Logged in as: {currentUser.email}</p>
          <p>UID: {currentUser.uid}</p>
          <p>Date Created: {new Date(currentUser.metadata.creationTime).toLocaleString()}</p>

          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

    </div>
  );
}

export default App;
