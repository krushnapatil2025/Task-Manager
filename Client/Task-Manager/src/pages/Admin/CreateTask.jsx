import React, { useState, useEffect } from 'react';
import { PRIORITY_DATA } from '../../utils/data';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { LuTrash2 } from 'react-icons/lu';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SelectDropdown from '../../components/Inputs/SelectDropdown';
import SelectUsers from '../../components/Inputs/SelectUsers';
import TodoListInput from '../../components/Inputs/TodoListInput';
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput';
import moment from 'moment';
import Modal from '../../components/Modal';
import DeleteAlert from '../../components/DeleteAlert';

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "low",
    dueDate: "",
    assignedTo: [],
    todoCheckList: [],
    attachments: [],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "low",
      dueDate: "",
      assignedTo: [],
      todoCheckList: [],
      attachments: [],
    });
  };

  const handleValueChange = (key, value) => {
    setTaskData((prev) => ({ ...prev, [key]: value }));
  };

  const createTask = async () => {
    setLoading(true);
    try {
      const todoList = taskData.todoCheckList.map((item) => ({
        title: item,
        completed: false,
      }));

      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todoList,
      });

      toast.success("Task created successfully!");
      clearData();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error?.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
    setLoading(true);
    try {
      const todoChecklist = taskData.todoCheckList.map((item) => ({
        title: item,
        completed: false,
      }));

      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist,
      });

      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error?.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const getTaskDetailsByID = async (taskId) => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));
      if (response.data) {
        const taskInfo = response.data;
        setTaskData({
          title: taskInfo.title,
          description: taskInfo.description,
          priority: taskInfo.priority,
          dueDate: taskInfo.dueDate
            ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
            : '',
          assignedTo: taskInfo.assignedTo?.map((item) => item?._id) || [],
          todoCheckList: taskInfo.todoChecklist?.map((item) => item?.title) || [],
          attachments: taskInfo.attachments || [],
        });
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Failed to fetch task details");
    }
  };

  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      setOpenDeleteAlert(false);
      toast.success('Task deleted successfully');
      navigate('/admin/tasks');
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!taskData.title.trim()) return setError("Task title is required");
    if (!taskData.description.trim()) return setError("Task description is required");
    if (!taskData.dueDate) return setError("Task due date is required");
    if (taskData.assignedTo?.length === 0) return setError("At least one user must be assigned");
    if (taskData.todoCheckList?.length === 0) return setError("At least one TODO item is required");

    if (taskId) {
      await updateTask();
    } else {
      await createTask();
    }
  };

  useEffect(() => {
    if (taskId) {
      getTaskDetailsByID(taskId);
    }
  }, [taskId]);

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-3 p-6 bg-white border border-gray-200 shadow-lg rounded-2xl text-black">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold tracking-wide">
                {taskId ? "Update Task" : "Create Task"}
              </h2>
              {taskId && (
                <button
                  className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full border border-red-300"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            <label className="block mb-2 text-sm font-medium">Task Title</label>
            <input
              placeholder="Create App UI"
              className="w-full px-4 py-2 mb-4 rounded-lg bg-white border border-gray-300 text-black"
              value={taskData.title}
              onChange={({ target }) => handleValueChange("title", target.value)}
            />

            <label className="block mb-2 text-sm font-medium">Description</label>
            <textarea
              placeholder="Describe task"
              className="w-full px-4 py-3 mb-4 rounded-lg bg-white border border-gray-300 text-black"
              rows={4}
              value={taskData.description}
              onChange={({ target }) => handleValueChange("description", target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Priority</label>
                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                  placeholder="Select Priority"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black"
                  value={taskData.dueDate || ''}
                  onChange={({ target }) => handleValueChange("dueDate", target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Assign To</label>
                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) => handleValueChange("assignedTo", value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">TODO Checklist</label>
              <TodoListInput
                todoList={taskData.todoCheckList}
                setTodoList={(value) => handleValueChange("todoCheckList", value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Add Attachments</label>
              <AddAttachmentsInput
                attachments={taskData.attachments}
                setAttachments={(value) => handleValueChange("attachments", value)}
              />
            </div>

            {error && <p className="text-sm text-red-600 font-medium mb-4">{error}</p>}

            <div className="flex justify-end">
              <button
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all"
                onClick={handleSubmit}
                disabled={loading}
              >
                {taskId ? "UPDATE TASK" : "CREATE TASK"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={() => deleteTask()}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;
