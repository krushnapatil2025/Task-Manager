import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const UploadImage = async (imageFile) => {
    const formData = new FormData(); // Fixed: capital F
    formData.append('image', imageFile); // Fixed: append, not appends

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        // Optionally return null or empty string so registration can continue
        return { imageUrl: "" };
    }
};

export default UploadImage;