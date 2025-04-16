// db-inspector.js
import { db } from './db';

// Function to list all messages in the database
export const listAllMessages = async () => {
  try {
    const messages = await db.messages.toArray();
    console.table(messages);
    return messages;
  } catch (error) {
    console.error("Failed to list messages:", error);
    return [];
  }
};

// Function to list messages by sender
export const listMessagesBySender = async (sender_id: any) => {
  try {
    const messages = await db.messages
      .where({ sender_id })
      .toArray();
    console.log(`Messages from sender ${sender_id}:`, messages);
    return messages;
  } catch (error) {
    console.error(`Failed to list messages from sender ${sender_id}:`, error);
    return [];
  }
};

// Function to list messages by receiver
export const listMessagesByReceiver = async (receiver_id: any, receiver_type: any) => {
  try {
    const messages = await db.messages
      .where({ receiver_id, receiver_type })
      .toArray();
    console.log(`Messages to receiver ${receiver_id} (${receiver_type}):`, messages);
    return messages;
  } catch (error) {
    console.error(`Failed to list messages to receiver ${receiver_id}:`, error);
    return [];
  }
};

// Function to list unread messages
export const listUnreadMessages = async () => {
  try {
    const messages = await db.messages
      .where({ isRead: false })
      .toArray();
    console.log("Unread messages:", messages);
    return messages;
  } catch (error) {
    console.error("Failed to list unread messages:", error);
    return [];
  }
};

// Function to count messages by various criteria
export const debugMessageCounts = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = currentUser?.id;
    
    if (!currentUserId) {
      console.error("Current user ID not found");
      return;
    }
    
    const totalCount = await db.messages.count();
    const unreadCount = await db.messages.where({ isRead: false }).count();
    const sentByCurrentUserCount = await db.messages.where({ sender_id: currentUserId }).count();
    const receivedByCurrentUserCount = await db.messages.where({ receiver_id: currentUserId }).count();
    
    console.log("Database Message Counts:");
    console.log("----------------------");
    console.log(`Total messages: ${totalCount}`);
    console.log(`Unread messages: ${unreadCount}`);
    console.log(`Sent by current user (${currentUserId}): ${sentByCurrentUserCount}`);
    console.log(`Received by current user (${currentUserId}): ${receivedByCurrentUserCount}`);
    
    // For each user that has messages in the database
    const uniqueSenders = new Set();
    const allMessages = await db.messages.toArray();
    allMessages.forEach(msg => uniqueSenders.add(msg.sender_id));
    
    for (const senderId of uniqueSenders) {
      if (senderId === currentUserId) continue; // Skip current user
      
      const fromSenderToCurrentUser = await db.messages.where({
        sender_id: senderId,
        receiver_id: currentUserId,
        isRead: false
      }).count();
      
      console.log(`Unread messages from user ${senderId} to current user: ${fromSenderToCurrentUser}`);
    }
  } catch (error) {
    console.error("Failed to debug message counts:", error);
  }
};