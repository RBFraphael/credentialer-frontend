export function randomPassword(length: number = 8): string
{
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()-_+={}:/\\?\"'";
    let password = "";

    for(let i = 0; i < length; i++){
        let index: number = Math.floor(Math.random() * chars.length);
        password += chars[index];
    }

    return password;
}