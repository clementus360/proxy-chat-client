import { LocationUpdater } from "@/components";
import { SocketProvider } from "@/context/SocketContext";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SocketProvider>
            <LocationUpdater />
            <div className="flex flex-col min-h-full w-full justify-center items-center">
                {children}
            </div>
        </SocketProvider>
    );
}