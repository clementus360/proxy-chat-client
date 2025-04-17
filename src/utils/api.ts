import axios from "axios";
import { UpdateUserData, UserData } from "./types";

const API = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    }
})

export const CreateUser = async (userData: UserData) => {
    try {
        const response = API.post("/users", userData)
        return (await response).data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error creating user:", error.response?.data);
        } else {
            console.error("Unexpected error:", error);
        }
        throw error
    }
}

export const UpdateUser = async (userData: UpdateUserData) => {
    console.log("Updating user data:", userData);
    try {
        const response = await API.patch(`/users?id=${userData.id}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

export const GetUsers = async (latitude: number, longitude: number, radius: number, id: number) => {
    try {
        const response = await API.get(`/users`, {
            params: { lat: latitude, long: longitude, radius, id },
        });

        return response.data.users;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error fetching users:", error.response?.data);
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
}