import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuUser } from "react-icons/lu";
import Modal from "../Modal";
import AvatarGroup from "../AvatarGroup";

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const toggleUserSelection = (userId) => {
        setTempSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAssign = () => {
        setSelectedUsers(tempSelectedUsers);
        setIsModalOpen(false);
    };

    const selectedUserAvatars = allUsers
        .filter((user) => selectedUsers.includes(user._id))
        .map((user) => user.profileImageUrl);

    useEffect(() => {
        getAllUsers();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            setTempSelectedUsers(selectedUsers);
        }
    }, [isModalOpen]);

    return (
        <div className="space-y-4 mt-2">
            {selectedUserAvatars.length === 0 && (
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 shadow transition"
                    onClick={() => setIsModalOpen(true)}
                >
                    <LuUser className="text-base text-gray-600" /> Add Members
                </button>
            )}

            {selectedUserAvatars.length > 0 && (
                <div
                    className="cursor-pointer transition hover:scale-105 duration-200"
                    onClick={() => setIsModalOpen(true)}
                >
                    <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Users"
            >
                <div className="space-y-4 h-[60vh] overflow-y-auto bg-white rounded-lg shadow-inner p-2">
                    {allUsers.map((user) => (
                        <div
                            key={user._id}
                            className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md hover:bg-gray-50 transition"
                        >
                            {user.profileImageUrl ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full shadow-sm border border-gray-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow">
                                    <LuUser className="text-xl text-gray-500" />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={tempSelectedUsers.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                                className="w-5 h-5 accent-blue-600 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition font-medium"
                        onClick={() => setIsModalOpen(false)}
                    >
                        CANCEL
                    </button>
                    <button
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:opacity-90 transition"
                        onClick={handleAssign}
                    >
                        DONE
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SelectUsers;
