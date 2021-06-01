export type User = {
    id: string,
    email: string,
    username: string
}

export type UserWithHashedPassword = User & {
    hashedPassword: string
}

export type UserData = User & {
    isActive: boolean
}