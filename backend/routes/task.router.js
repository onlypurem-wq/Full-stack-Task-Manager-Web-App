const express = require("express");
const router = express.Router();
const {
    createTask, getTasks, getTask, editTask, deleteTask,
    getTrash, restoreTask, restoreAll, permanentDelete, emptyTrash
} = require('../controllers/task.controller.js')
const protect = require("../middleware/auth.middleware")

router.get('/', protect, getTasks);
router.get('/trash', protect, getTrash);      // must stay above '/:id'
router.get('/:id', protect, getTask);

router.post('/', protect, createTask);

router.put('/trash/restore', protect, restoreAll);  // must stay above '/:id/restore'
router.put('/:id/restore', protect, restoreTask);
router.put('/:id', protect, editTask);

router.delete('/trash', protect, emptyTrash); // must stay above '/:id'
router.delete('/:id/permanent', protect, permanentDelete);
router.delete('/:id', protect, deleteTask);

module.exports = router;