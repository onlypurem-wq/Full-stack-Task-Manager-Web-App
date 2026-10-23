const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        task: {
            type: String,
            required: true
        },
        done: {
            type: Boolean,
            required: true
        },
        dueDate: { type: Date },
        deletedAt: { type: Date, default: null }
    },
    {
        timestamps: true
    }
)

// MongoDB removes a task for good 7 days after its deletedAt date.
// Tasks that were never deleted have no date there, so they're never touched.
taskSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;