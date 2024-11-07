const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const Task = require('../models/task');

//creating new task
router.post('/', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });
        await task.save();
        res.status(201).json({ task, message: "Task created successfully" });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

//fetching all tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({
            owner: req.user._id
        });
        res.status(200).json({ tasks, count: tasks.length, message: "Tasks fetched successfully" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

//updating tasks
router.patch('/:id', auth, async (req, res) => {
    const taskId = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'status', 'dueDate']; // Updated allowed fields
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const task = await Task.findOne({
            _id: taskId,
            owner: req.user.id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        updates.forEach((update) => {
            task[update] = req.body[update];
        });

        await task.save();

        res.json({ task, message: 'Task updated successfully' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

//deleting tasks
router.delete('/:id', auth, async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Task.findOneAndDelete({
            _id: taskId,
            owner: req.user.id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ task, message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//fetching pending tasks
router.get('/pending', auth, async (req, res) => {
    try {
        // Build the query filter to fetch only pending tasks
        const filter = {
            owner: req.user._id,
            status: 'pending'  // Filter only tasks that are 'pending'
        };

        // Fetch tasks based on the filter
        const tasks = await Task.find(filter);

        res.status(200).json({
            tasks,
            count: tasks.length,
            message: 'Pending tasks fetched successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
//fetching completed tasks
router.get('/completed', auth, async (req, res) => {
    try {
        // Build the query filter to fetch only completed tasks
        const filter = {
            owner: req.user._id,
            status: 'completed'  // Filter only tasks that are 'completed'
        };

        // Fetch tasks based on the filter
        const tasks = await Task.find(filter);

        res.status(200).json({
            tasks,
            count: tasks.length,
            message: 'Completed tasks fetched successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
