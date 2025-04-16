"use client"

import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, GroupIcon, UserIcon } from "@/components";
import { SettingIcon } from "@/components/Icons/Setting";
import { PlusIcon } from "@/components/Icons/PlusIcon";

export default function Home() {
  const { user, isActive, isLoggedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn === undefined) {
      return;
    }

    if (!isLoggedIn) {
      router.push("/sign-in");
    } else {
      router.push("/chat/users");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn !== undefined) {
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <p>Loading...</p>
    )
  }

  return (
    <main className="flex flex-col justify-center items-center min-h-screen min-w-screen font-[family-name:var(--font-inter)]">
    </main >
  );
}
