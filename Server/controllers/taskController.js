const Task = require("../models/Task");
const { get } = require("../routes/authRoutes");
const mongoose = require("mongoose");



//@desc Get all tasks (admin:all ,User:only assigned tasks)
//@route GET /api/tasks
//@access Private
const getTasks = async (req, res) => {
    try {
        const {status} = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }

        let tasks;
        if (req.user.role === "admin") {
            tasks = await Task.find(filter).populate("assignedTo", "name email profileImageUrl");
        }else{
            tasks= await Task.find({ assignedTo: req.user._id, ...filter }).populate("assignedTo", "name email profileImageUrl");
        }

        //add completed todochecklist count to each task
        tasks= await Promise.all (tasks.map(async (task) => {
            const completedCount= task.todoChecklist.filter(item => item.completed).length;
            return {
                ...task._doc,
                completedTodoCount: completedCount
            };
        }
        ));
         //status summary counts
        const allTasks = await Task.countDocuments(
            req.user.role === "admin" ? {} : { assignedTo: req.user._id }
        );

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status: "Pending",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        });

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status: "In Progress",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        });

        const completedTasks = await Task.countDocuments({
            ...filter,
            status: "Completed",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        });

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            },
        });

    } catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

//@desc Get task by ID
//@route GET /api/tasks/:id
//@access Private
const getTaskById = async (req, res) => {
    try {
        // Populate assignedTo and return as assignedTo
        const task = await Task.findById(req.params.id).populate("assignedTo", "_id name email profileImageUrl");
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        const { assignedTo, ...rest } = task._doc;
        res.json({
            ...rest,
            assignedTo: assignedTo
        });
    } catch (error) {
        console.error("Error in getTaskById:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// @desc Create a new task (admin only)
// @route POST /api/tasks
// @access Private
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            assignedTo,
            dueDate,
            attachments,
            todoChecklist
        } = req.body;

        // ✅ Check that assignedTo is an array
        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
        }

        // ✅ Optional: Validate assignedTo contains valid Mongo ObjectIDs
        const isValid = assignedTo.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!isValid) {
            return res.status(400).json({ message: "assignedTo contains invalid user IDs" });
        }

        // ✅ Check that todoChecklist is an array
        if (!Array.isArray(todoChecklist)) {
            return res.status(400).json({ message: "todoChecklist must be an array" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            assignedTo,
            dueDate,
            attachments,
            todoChecklist,
            createdBy: req.user._id
        });

        res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
        console.error("Error in createTask:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


//@desc Update task by ID (admin only)
//@route PUT /api/tasks/:id
//@access Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.status = req.body.status || task.status;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        // ✅ Fix: assignedTo must be an array of user IDs
        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
            }
            const isValid = req.body.assignedTo.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!isValid) {
                return res.status(400).json({ message: "assignedTo contains invalid user IDs" });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();

        res.json({ message: "Task updated successfully", updatedTask });

    } catch (error) {
        console.error("Error in updateTask:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



//@desc Delete task by ID (admin only)
//@route DELETE /api/tasks/:id
//@access Private(Admin only)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        await task.deleteOne();
        res.json({ message: "Task deleted successfully" });

    } catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


//@desc Update task Status
//@route PUT /a[i/tasks/:id/todo
//access Private 
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Check if the current user is assigned to the task
        const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

        if (!isAssigned) {
            return res.status(403).json({ message: "You are not assigned to this task" });
        }
        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach(item => {
                item.completed = true; // Mark all checklist items as completed
            });
            task.progress = 100; // Set progress to 100% when completed
        }

        await task.save();
        res.json({ message: "Task status updated successfully", task });

    } catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task checklist
// @route PUT /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user._id.toString();

    const isAssigned = Array.isArray(task.assignedTo)
      ? task.assignedTo.map(id => id.toString()).includes(userId)
      : task.assignedTo.toString() === userId;

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to update checkList" });
    }

    // ✅ Extract checklist from req.body.todoChecklist
    const updatedChecklist = req.body.todoChecklist;

    if (!Array.isArray(updatedChecklist)) {
      return res.status(400).json({ message: "todoChecklist must be an array" });
    }

    task.todoChecklist = updatedChecklist;

    // ✅ Update progress and status
    const completedCount = task.todoChecklist.filter(item => item.completed).length;
    const totalItems = task.todoChecklist.length;
    task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate("assignedTo", "name email profileImageUrl");

    res.json({ message: "Task checklist updated successfully", task: updatedTask });

  } catch (error) {
    console.error("Error in updateTaskChecklist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//desc Dashboard data for admin
//@route GET /api/tasks/dashboard-data
//@access Private
const getDashboardData = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: "Pending" });
        const completedTasks = await Task.countDocuments({ status: "Completed" });
        // Fix: Use $and to combine conditions for overdueTasks
        const overdueTasks = await Task.countDocuments({
            $and: [
                { dueDate: { $lt: new Date() } },
                { status: { $ne: "Completed" } }
            ]
        });

        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = taskDistributionRaw.find(item => item._id === status)?.count || 0;
            return acc;
        }, {});
            taskDistribution["All"] = totalTasks;

            const taskPriorities = ["low", "medium", "high"];
            const taskPriorityDistributionRaw = await Task.aggregate([
                {
                    $group: {
                        _id: "$priority",
                        count: { $sum: 1 }
                    }
                }
            ]);
            const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
                acc[priority] = taskPriorityDistributionRaw.find(item => item._id === priority)?.count || 0;
                return acc;
            }, {});
            
            const recentTasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt")

            res.status(200).json({
                statistics: {
                    totalTasks,
                    pendingTasks,
                    completedTasks,
                    overdueTasks,
                },

                charts: {
                    taskDistribution,
                    taskPriorityLevels
                },
                recentTasks,
            });

    } catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Dashboard data for user
//@route GET /api/tasks/user-dashboard-data
//@access Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;
        const totalTasks = await Task.countDocuments({ assignedTo: userId});
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            dueDate: { $lt: new Date() },
            status: { $ne: "Completed" }
        });

        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $match: { assignedTo: userId }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = taskDistributionRaw.find(item => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        const taskPriorities = ["low", "medium", "high"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $match: { assignedTo: userId }
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelsRaw.find(item => item._id === priority)?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");
        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPriorityLevels
                },
            recentTasks
        });
    } catch (error) {
        console.error("Error in getUserDashboardData:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData

}