import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase'; 

const UpdateForm = ({ updateData, cancelUpdate }) => {
  const [title, setTitle] = useState(updateData ? updateData.title : '');
  const [status, setStatus] = useState(updateData ? updateData.status : false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      await axios.put(`http://localhost:8000/tasks/${updateData.id}`, {
        title: title,
        status: status
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      cancelUpdate();
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  return (
    <>
      <form onSubmit={handleUpdate} className='editTodo' name='updateTodo'>
        <div className="row">
          <div className="col">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control form-control-lg"
              required
            />
          </div>
          <div className="col-auto">
            <input
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              className="form-check-input"
            />
            <label className="form-check-label">
              Completed
            </label>
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-lg btn-success mr-20">Update</button>
            <button type="button" onClick={cancelUpdate} className="btn btn-lg btn-warning">Cancel</button>
          </div>
        </div>
      </form>
      <br />
    </>
  );
};

export default UpdateForm;
