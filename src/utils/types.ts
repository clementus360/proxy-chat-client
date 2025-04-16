export interface UserData {
    username: string;
    latitude: number;
    longitude: number;
    visible: boolean;
    image_url: string;
}

export interface UpdateUserData {
    id: number;
    username?: string;
    latitude?: number;
    longitude?: number;
    visible?: boolean;
    image_url?: string;
}

export type ChatType = "user" | "group";

export interface Message {
    type: string;
    sender_id: number;
    sender_name: string;
    receiver_id?: number; // optional now
    group_id?: number;
    created_at: string;
    content: string;
}

export interface NewMessage extends Message {
    receiver_type?: "user" | "group";
}

export interface Chat {
    id: string;
    username?: string;
    name?: string;
    image_url: string;
    online?: boolean;
    visible?: boolean;
    last_active?: string;
    created_at?: string;
}