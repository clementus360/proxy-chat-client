"use client"
import { addMessage } from "@/utils/db";
import { NewMessage } from "@/utils/types";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  setSocket: (socket: WebSocket | null) => void;
  removeSocket: () => void;
  registerMessageCallback: (callback: (message: NewMessage) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setCurrentSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const messageCallbacks = useRef<Set<(message: NewMessage) => void>>(new Set());

  // Debug the number of registered callbacks
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log(`Socket Context: ${messageCallbacks.current.size} callbacks registered`);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Function to register a callback
  const registerMessageCallback = useCallback((callback: (message: NewMessage) => void) => {
    console.log("Socket Context: Registering new message callback");
    messageCallbacks.current.add(callback);
    console.log(`Socket Context: Now have ${messageCallbacks.current.size} callbacks`);
    
    // Return a function to unregister the callback
    return () => {
      console.log("Socket Context: Unregistering message callback");
      messageCallbacks.current.delete(callback);
      console.log(`Socket Context: Now have ${messageCallbacks.current.size} callbacks`);
    };
  }, []);

  useEffect(() => {
    const connectSocket = () => {
      console.log("Socket Context: Connecting socket...");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        console.error("Socket Context: User ID not found");
        return;
      }
      
      const newSocket = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/ws?user_id=${user?.id}`);
      
      newSocket.onopen = () => {
        console.log("Socket Context: WebSocket connected");
        setIsConnected(true);
      };
      
      newSocket.onclose = (event) => {
        console.log("Socket Context: WebSocket disconnected", event.reason);
        setIsConnected(false);
        setTimeout(connectSocket, 3000); // Reconnect after 3 seconds
      };
      
      newSocket.onmessage = (event) => {
        const data: NewMessage = JSON.parse(event.data);
        console.log("Socket Context: WebSocket message received", data);
        
        // Add message to DB first
        addMessage(data);
        
        // Then notify all registered callbacks
        console.log(`Socket Context: Notifying ${messageCallbacks.current.size} callbacks`);
        messageCallbacks.current.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error("Socket Context: Error in message callback:", error);
          }
        });
      };
      
      newSocket.onerror = (error) => {
        console.error("Socket Context: WebSocket error", error);
      }
      
      setCurrentSocket(newSocket);
    }
    
    connectSocket();
    
    return () => {
      if (socket) {
        console.log("Socket Context: Closing socket on cleanup");
        socket.close();
      }
    }
  }, []);

  const setSocket = (newSocket: WebSocket | null) => {
    setCurrentSocket(newSocket);
  }
  
  const removeSocket = () => {
    if (socket) {
      socket.close();
    }
    setCurrentSocket(null);
    setIsConnected(false);
  }
  
  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      setSocket, 
      removeSocket, 
      registerMessageCallback 
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}