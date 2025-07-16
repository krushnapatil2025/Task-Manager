const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");


const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select("-password");
        const userWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "pending" });
            const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: "in-progress" });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "completed" });
            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks
            };
        }));
        res.json(userWithTaskCounts);
    } catch (error) {
        console.error("Error in getUsers:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserById:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete associated tasks
        await Task.deleteMany({ user: user._id });

        // Delete user
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = {
    getUsers,
    getUserById,
    deleteUser
};