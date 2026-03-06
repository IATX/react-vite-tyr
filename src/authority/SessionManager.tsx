import type { UserInfo } from "./AccSession";

export class SessionManager {
    public static isGuest(user: UserInfo): boolean {
        return user.id === '-1';
    }

    public static isAdmin(user: UserInfo): boolean {
        return user.roles.some(role => role.key === 'admin');
    }

    public static isPermanent(): boolean {
        return (localStorage.getItem('sharedSessionId') !== null && localStorage.getItem('sharedSessionId') !== '');
    }

    public static setPermanentToken(token: string): void {
        localStorage.setItem('sharedSessionId', token);
    }

    public static getPermanentToken(): string {
        if (localStorage.getItem('sharedSessionId') !== null) {
            return localStorage.getItem('sharedSessionId') ?? '';
        }

        return '';
    }

    public static transform(jsonInfo: any): UserInfo {
        return {
            id: jsonInfo.userId,
            name: jsonInfo.userName,
            pictureUrl: jsonInfo.pictureUrl,
            roles: jsonInfo.roles.map((role: any) => ({
                key: role.key,
                name: role.name,
            }))
        };
    }

}