import React, { useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const ToDo = ({ tasks, filter, markDone, setUpdateData, deleteTask }) => {

  useEffect(() => {
    console.log('Tasks:', tasks);
  }, [tasks]);

  const handleRequest = async (url, method, data = null) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      const config = {
        method: method,
        url: url,
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);

      return response.data;
    } catch (err) {
      console.error(err);
      alert(`Failed to ${method === 'DELETE' ? 'delete' : 'update'} task: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    await handleRequest(`http://localhost:8000/tasks/${id}`, 'DELETE');
    deleteTask(id);
  };

  const handleMarkDone = async (id, completed) => {
    console.log(`Marking task ${id} as ${completed ? 'not done' : 'done'}`);
    if (!id) {
      console.error('id is undefined');
      return;
    }
    const newStatus = !completed;
    console.log(`Sending new status: ${newStatus}`);
    await handleRequest(`http://localhost:8000/tasks/toggle/${id}`, 'PUT', { status: newStatus });
    markDone(id, newStatus);
  };  

  const handleEdit = (task) => {
    setUpdateData(task);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') {
      return task.status;
    } else if (filter === 'active') {
      return !task.status;
    }
    return true;
  });

  return (
    <div>
      {filteredTasks.map(task => (
        <div key={task.id} className="task-item">
          <input
            type="checkbox"
            checked={task.status}
            onChange={() => handleMarkDone(task.id, task.status)}
          />
          <span style={{ textDecoration: task.status ? 'line-through' : 'none' }}>
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
