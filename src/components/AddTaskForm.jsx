import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const AddTaskForm = () => {
    const [newTask, setNewTask] = useState('');

    const addTask = async () => {
        if (!newTask.trim()) return;

        try {
            const token = await auth.currentUser.getIdToken(true);
            await axios.post('http://localhost:8000/tasks', {
                title: newTask, 
                user_id: auth.currentUser.uid 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNewTask('');
            window.location.reload();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        addTask();
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="newTask">New Task</label>
                    <input
                        type="text"
                        className="form-control"
                        id="newTask"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task"
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3">Add Task</button>
            </form>
        </div>
    );
};

export default AddTaskForm;
