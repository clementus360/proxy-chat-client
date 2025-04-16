export const generateAvatarUrl = (username: string): string => {
    const userName = username.replace(/ /g, ""); // Remove spaces from username
    const randomId = Math.floor(Math.random() * 1000000); // Generate a random number for the background color
    const backgroundColor = ((randomId * 12345 + 100000) & 0xB0B0B0).toString(16).padStart(6, '0'); // Generate a background color
    const textColor = "ffffff"; // Text color for avatar

    // Generate the avatar URL using ui-avatars.com
    return `https://ui-avatars.com/api/?name=${userName}&background=${backgroundColor}&color=${textColor}&size=256`;
};