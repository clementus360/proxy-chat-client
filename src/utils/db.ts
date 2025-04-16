import Dexie, { EntityTable } from "dexie";
import { Message } from "./types";

export interface StoredMessage extends Message {
    id?: number;
    isRead: boolean;
    receiver_type: "user" | "group";
    receiver_id: number;
}

export const db = new Dexie("ChatDB") as Dexie & {
    messages: EntityTable<StoredMessage, "id">;
};

db.version(1).stores({
    messages: "++id, receiver_id, receiver_type, sender_id, created_at, isRead",
});

// Add message
export const addMessage = async (message: Message) => {
    const isGroup = !!message.group_id;

    const storedMessage: StoredMessage = {
        ...message,
        isRead: false,
        receiver_type: isGroup ? "group" : "user",
        receiver_id: isGroup ? message.group_id! : message.receiver_id!,
    };

    console.log("Adding message to DB:", storedMessage);

    try {
        await db.messages.add(storedMessage);
        console.log("Message added successfully");
    } catch (error) {
        console.error("Failed to add message:", error);
    }
};

// Get messages by receiver id and type
export const getMessages = async (
    chatPartnerId: number,
    receiver_type: "user" | "group"
) => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')

        return await db.messages
            .where('receiver_type')
            .equals(receiver_type)
            .filter(msg =>
                (msg.sender_id === user.id && msg.receiver_id === chatPartnerId) ||
                (msg.sender_id === chatPartnerId && msg.receiver_id === user.id)
            )
            .sortBy('created_at');
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return [];
    }
};

// Mark message as read
export const markMessageAsRead = async (id: number) => {
    try {
        await db.messages.update(id, { isRead: true });
    } catch (error) {
        console.error("Failed to update message:", error);
    }
};

// Count unread messages by receiver
export const getUnreadCount = async (sender_id: number, receiver_id: number) => {
    try {
        return await db.messages
            .where("sender_id")
            .equals(sender_id)
            .and(message => message.receiver_id === receiver_id && message.isRead === false)
            .count()
    } catch (error) {
        console.error("Failed to count unread messages:", error);
        return 0;
    }
};

export const debugMessages = async () => {
    try {
        const allMessages = await db.messages.toArray();
        console.log("All messages in DB:", allMessages);
        return allMessages;
    } catch (error) {
        console.error("Failed to debug messages:", error);
        return [];
    }
};