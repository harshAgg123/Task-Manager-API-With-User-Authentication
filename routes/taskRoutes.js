const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewares/auth');
const Task = require('../models/task');

// //creating new task
// router.post('/', auth, async (req, res) => {
//     try {
//         const task = new Task({
//             ...req.body,
//             owner: req.user._id
//         });
//         await task.save();
//         res.status(201).json({ task, message: "Task created successfully" });
//     } catch (err) {
//         res.status(400).send({ error: err.message });
//     }
// });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Set folder for file storage
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Generate unique filenames
    }
  });
  
  const upload = multer({ storage });
  
  // Route to create a task with file attachment
  router.post('/', auth, upload.single('attachment'), async (req, res) => {
    try {
      const task = new Task({
        ...req.body,
        owner: req.user._id,
        attachment: req.file ? req.file.path : null // Store file path
      });
      await task.save();
      res.status(201).json({ task, message: "Task created successfully" });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });

//fetching all tasks

// router.get('/', auth, async (req, res) => {
//     const page = parseInt(req.query.page) || 1; 
//     const limit = parseInt(req.query.limit) || 10;
//     const { status } = req.query;

//     const filter = { owner: req.user._id };
//     if (status) {
//         filter.status = status; 
//     }

//     try {
//         const tasks = await Task.find(filter)
//             .skip(skip)
//             .limit(limit);

//         const totalTasks = await Task.countDocuments(filter);
//         const totalPages = Math.ceil(totalTasks / limit);

//         res.status(200).json({
//             tasks,
//             count: tasks.length,
//             totalTasks,
//             totalPages,
//             currentPage: page,
//             message: "Tasks fetched successfully with filter"
//         });
//     } catch (err) {
//         res.status(500).send({ error: err.message });
//     }
// });

router.get('/', auth, async (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 tasks per page if not provided
    const { status } = req.query;

    const filter = { owner: req.user._id };
    if (status) {
        filter.status = status;  // Apply status filter if provided
    }

    const skip = (page - 1) * limit;  // Calculate skip based on page and limit

    try {
        const tasks = await Task.find(filter)
            .skip(skip)  // Now skip is defined
            .limit(limit);

        const totalTasks = await Task.countDocuments(filter);  // Get the total number of tasks
        const totalPages = Math.ceil(totalTasks / limit);  // Calculate total pages

        res.status(200).json({
            tasks,
            count: tasks.length,
            totalTasks,
            totalPages,
            currentPage: page,
            message: "Tasks fetched successfully with filter"
        });
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
