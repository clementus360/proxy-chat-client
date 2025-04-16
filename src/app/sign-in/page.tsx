"use client"
import { useEffect, useState } from "react";
import { Logo, TextInput, Button, LocationIcon } from "@/components";
import { getUserLocation } from "@/utils/geolocation";
import { UserData } from "@/utils/types";
import { generateAvatarUrl } from "@/utils/userAvatar";
import { CreateUser } from "@/utils/api";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Page() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState<boolean>(true)
    const { setUser } = useUser();
    const { isLoggedIn } = useUser();
    const router = useRouter();

    useEffect(() => {
            if (isLoggedIn === undefined) {
                return;
            }
    
            if (!isLoggedIn) {
                router.push("/sign-in");
            } else {
                router.push("/chat/users");
            }

            setLoading(false);
    }, [isLoggedIn, router])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const location = await getUserLocation()

            if (location) {
                const userData: UserData = {
                    username: name,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    visible: true,
                    image_url: generateAvatarUrl(name)
                }

                const response = await CreateUser(userData)

                // Assuming the response contains the user data
                const createdUser = response;

                // Add the created user data to context
                setUser({
                    id: createdUser.id,
                    username: createdUser.username,
                    image_url: createdUser.image_url,
                    latitude: createdUser.latitude,
                    longitude: createdUser.longitude,
                    created_at: createdUser.created_at,
                    last_active: createdUser.last_active,
                    visible: createdUser.visible,
                });

                router.push("/chat/users");

                console.log("user created: ", response)

            } else {
                console.error("Location not available")
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (loading) {
        return (
            <main className="grid justify-center items-center min-h-screen min-w-screen font-[family-name:var(--font-inter)]">
                <div className="flex flex-col items-center justify-center gap-16 min-w-screen px-4 md:min-w-[30rem]">
                    <div className="flex flex-col gap-2 items-center">
                        <span className="w-24 h-24">
                            <Logo />
                        </span>
                        <h1 className="text-white font-semibold font-[family-name:var(--font-urbanist)]">ProxiChat</h1>
                    </div>

                    <h2 className="text-4xl text-white font-semibold font-[family-name:var(--font-urbanist)]">Loading...</h2>
                </div>
            </main>
        )
    }

    return (
        <main className="grid justify-center items-center min-h-screen min-w-screen font-[family-name:var(--font-inter)]">
            <div className="flex flex-col items-center justify-center gap-16 min-w-screen px-4 md:min-w-[30rem]">
                <div className="flex flex-col gap-2 items-center">
                    <span className="w-24 h-24">
                        <Logo />
                    </span>
                    <h1 className="text-white font-semibold font-[family-name:var(--font-urbanist)]">ProxiChat</h1>
                </div>

                <h2 className="text-4xl text-white font-semibold font-[family-name:var(--font-urbanist)]">Welcome!</h2>

                <div className="flex flex-col gap-4 w-full">
                    <TextInput
                        label="Name"
                        type="text"
                        name="name"
                        placeholder="Enter Your Name*"
                        onChange={handleNameChange}
                        value={name}
                        errorMessage={""}
                    />

                    <Button onClick={handleSubmit} variant="primary" icon={<LocationIcon />} iconPosition="right" className="w-full">
                        Join Chat Now
                    </Button>
                </div>

            </div>
        </main>
    )
}
