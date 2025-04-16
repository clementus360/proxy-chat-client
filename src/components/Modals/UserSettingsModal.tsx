// components/UserSettingsModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { XIcon, Upload } from "lucide-react";
import { Button, Toggle } from "@/components";
import { UpdateUser } from "@/utils/api";
import { useUser } from "@/context/UserContext";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/utils/firebase";
import imageCompression from "browser-image-compression";

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, toggleVisibility, setUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | ArrayBuffer | null>("");

    const changeVisibility = async () => {
        if (!user?.id) {
            console.error("User ID is not defined");
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await UpdateUser({
                id: user.id,
                visible: !user.visible, // Toggle visibility
            });

            console.log("User visibility updated:", updatedUser);
            console.log(loading)
            toggleVisibility(); // Update context after success
        } catch (error) {
            console.error("Failed to update user visibility:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && isOpen) {
            setUsername(user.username || "");
            setImageUrl(user.image_url || "");
            setPreviewUrl("");
            setImageFile(null);
        }
    }, [user, isOpen]);

    const handleUpdateProfile = async () => {
        if (!user?.id) {
            console.error("User ID is not defined");
            return;
        }

        setUpdateLoading(true);

        try {
            // Handle image upload first if a file is selected
            let finalImageUrl = imageUrl;

            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);

                if (imageFile) {
                    const imageRef = ref(storage, `avatars/${user.id}_${Date.now()}`);
                    await uploadBytes(imageRef, imageFile);
                    finalImageUrl = await getDownloadURL(imageRef);
                }
            }

            console.log("Final image URL:", finalImageUrl);

            const updatedUser = await UpdateUser({
                id: user.id,
                username: username,
                image_url: finalImageUrl,
            });

            console.log("User profile updated:", updatedUser);

            // Update user context with new values
            if (setUser) {
                setUser({
                    ...user,
                    username: username,
                    image_url: finalImageUrl,
                });
            }

            onClose();
        } catch (error) {
            console.error("Failed to update user profile:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    // Function to generate a new random avatar
    const generateNewAvatar = () => {
        const seed = Math.random().toString(36).substring(2, 15);
        setImageUrl(`https://api.dicebear.com/9.x/bottts/png?seed=${seed}`);
        setPreviewUrl("");
        setImageFile(null);
    };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedFile = await imageCompression(file, {
                    maxSizeMB: 0.3, // Limit file size (~300KB)
                    maxWidthOrHeight: 800, // Resize to max 800px
                    useWebWorker: true, // Use a background thread
                });

                setImageFile(compressedFile);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(compressedFile);
            } catch (err) {
                console.error("Image compression failed:", err);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md relative animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <XIcon size={20} />
                </button>

                <h2 className="text-xl text-white font-bold mb-6">Profile Settings</h2>

                {/* Profile picture */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4 group">
                        <Image
                            src={
                                typeof previewUrl === "string" && previewUrl.length > 0
                                    ? previewUrl
                                    : imageUrl || "https://api.dicebear.com/9.x/bottts/png"
                            } width={100}
                            height={100}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-2 border-indigo-500 object-cover"
                        />
                        <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Upload size={20} className="text-white mr-1" />
                            <span className="text-xs text-white font-medium">Upload Image</span>
                        </label>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={generateNewAvatar}
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                            Generate Random Avatar
                        </button>
                        {previewUrl && (
                            <button
                                onClick={() => {
                                    setPreviewUrl("");
                                    setImageFile(null);
                                }}
                                className="text-sm text-red-400 hover:text-red-300"
                            >
                                Cancel Upload
                            </button>
                        )}
                    </div>
                </div>

                {/* Username */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter username"
                    />
                </div>

                {/* Visibility toggle */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300">
                            Visibility
                        </label>
                        <Toggle checked={user?.visible} onChange={changeVisibility} size="md" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        {user?.visible ? "Your profile is visible to nearby users" : "Your profile is hidden from nearby users"}
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3">
                    <Button
                        className="!bg-gray-700 w-full"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-full text-nowrap"
                        variant="primary"
                        onClick={handleUpdateProfile}
                        loading={updateLoading}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}