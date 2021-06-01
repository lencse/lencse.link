import { User, UserData } from "../user/types";

export type Link = {
    id: string,
    shortLink: string,
    redirectTo: string
}

export type LinkToSave = Link & {
    userId: string
}

export type LinkData = Link & {
    creationDate: Date
    user: UserData
    hitCount: number
}
