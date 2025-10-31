export interface Role {
    key: string;
    name: string;
}

export interface UserInfo {
    id: string,
    name: string,
    pictureUrl: string | null,
    roles: Role[]
}