const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get('/tasks', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/tasks');
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            console.log(`Error fetching tasks with status ${error.response.status}`);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.log('No response received while fetching tasks');
            res.status(503).json({ message: "Backend service unavailable" });
        } else {
            console.log('Error in making request to fetch tasks:', error.message);
            res.status(500).json({ message: "Internal server error fetching tasks" });
        }
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8000/tasks', req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            console.log(`Error creating task with status ${error.response.status}`);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.log('No response received while creating tasks');
            res.status(503).json({ message: "Backend service unavailable" });
        } else {
            console.log('Error in making request to create tasks:', error.message);
            res.status(500).json({ message: "Internal server error creating tasks" });
        }
    }
});

app.put('/tasks/:task_id', async (req, res) => {
    try {
        const response = await axios.put(`http://localhost:8000/tasks/${req.params.task_id}`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            console.log(`Error updating task with status ${error.response.status}`);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.log('No response received while updating task');
            res.status(503).json({ message: "Backend service unavailable" });
        } else {
            console.log('Error in making request to update task:', error.message);
            res.status(500).json({ message: "Internal server error updating task" });
        }
    }
});

app.delete('/tasks/:task_id', async (req, res) => {
    try {
        const response = await axios.delete(`http://localhost:8000/tasks/${req.params.task_id}`);
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            console.log(`Error deleting task with status ${error.response.status}`);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.log('No response received while deleting task');
            res.status(503).json({ message: "Backend service unavailable" });
        } else {
            console.log('Error in making request to delete task:', error.message);
            res.status(500).json({ message: "Internal server error deleting task" });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
