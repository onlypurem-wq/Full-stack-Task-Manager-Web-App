const Task = require("../models/task.model")
const createNotification = require("./notification.helper");

const TRASH_DAYS = 7; // keep in sync with the index in task.model.js

const createTask = async (req, res) => {
    try {
        const { title, task, done, dueDate } = req.body;

        const created = await Task.create({
            title,
            task,
            done,
            dueDate,
            user: req.user._id
        });

        try {
            await createNotification({
                user: req.user._id,
                task: created._id,
                message: `You added a task: ${created.title}`,
                type: "task_added",
            });
        } catch (notificationError) {
            console.error(
                "Could not create task notification:",
                notificationError
            );
        }

        res.status(200).json(created);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id, deletedAt: null });
        res.status(200).json(tasks)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const getTask = async (req, res) => {
    try {
        const {id} = req.params;
        const task = await Task.findOne({ _id: id, user: req.user._id, deletedAt: null })

        if (!task) {
            return res.status(404).json("Task not found")
        }

        res.status(200).json(task)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const editTask = async (req, res) => {
    try {
        const {id} = req.params;

        // Only let the client change these fields
        const allowed = ["title", "task", "done", "dueDate"];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const task = await Task.findOneAndUpdate(
            { _id: id, user: req.user._id, deletedAt: null },
            updates,
            { new: true, runValidators: true }
        )

        if (!task) {
            return res.status(404).json("Task not found")
        }

        res.status(200).json(task)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

// "Delete" now moves the task to the trash
const deleteTask = async (req, res) => {
    try {
        const {id} = req.params;
        const task = await Task.findOneAndUpdate(
            { _id: id, user: req.user._id, deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        )

        if (!task) {
            return res.status(404).json("Task not found")
        }

        res.status(200).json("moved to trash")
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

// Trash: tasks deleted within the last 7 days, newest first
const getTrash = async (req, res) => {
    try {
        const since = new Date(Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000);
        const tasks = await Task.find({
            user: req.user._id,
            deletedAt: { $gte: since }
        }).sort({ deletedAt: -1 });
        res.status(200).json(tasks)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const restoreTask = async (req, res) => {
    try {
        const {id} = req.params;
        const task = await Task.findOneAndUpdate(
            { _id: id, user: req.user._id, deletedAt: { $ne: null } },
            { deletedAt: null },
            { new: true }
        )

        if (!task) {
            return res.status(404).json("Task not found in trash")
        }

        res.status(200).json(task)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

// Delete forever (only works on tasks that are already in the trash)
const permanentDelete = async (req, res) => {
    try {
        const {id} = req.params;
        const task = await Task.findOneAndDelete({
            _id: id,
            user: req.user._id,
            deletedAt: { $ne: null }
        })

        if (!task) {
            return res.status(404).json("Task not found in trash")
        }

        res.status(200).json("deleted forever")
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const emptyTrash = async (req, res) => {
    try {
        await Task.deleteMany({ user: req.user._id, deletedAt: { $ne: null } })
        res.status(200).json("trash emptied")
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

const restoreAll = async (req, res) => {
    try {
        const since = new Date(Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000);
        await Task.updateMany(
            { user: req.user._id, deletedAt: { $gte: since } },
            { deletedAt: null }
        )
        res.status(200).json("all tasks restored")
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

module.exports = {
    createTask, getTasks, getTask, editTask, deleteTask,
    getTrash, restoreTask, permanentDelete, emptyTrash, restoreAll
};