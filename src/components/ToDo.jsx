import React from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const ToDo = ({ tasks, filter, markDone, setUpdateData, deleteTask }) => {

  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      await axios.delete(`http://localhost:8000/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      deleteTask(id);
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  const handleMarkDone = async (id, completed) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      await axios.put(`http://localhost:8000/tasks/${id}`, {
        completed: !completed
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      markDone(id);
    } catch (err) {
      alert(`Failed to update task status: ${err.message}`);
    }
  };

  const handleEdit = (task) => {
    setUpdateData(task);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') {
      return task.completed;
    } else if (filter === 'active') {
      return !task.completed;
    }
    return true; 
  });

  return (
    <div>
      {filteredTasks.map(task => (
        <div key={task.id} className="task-item">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => handleMarkDone(task.id, task.completed)}
          />
          <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.title}
          </span>
          <button onClick={() => handleEdit(task)}>Edit</button>
          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ToDo;
