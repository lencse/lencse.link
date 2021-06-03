import { LinkToSave } from "../link/types";
import { User, UserWithHashedPassword } from "../user/types";

export type SeedData = {
    users: (User & { deactivated: boolean, password: string })[]
    links:  (LinkToSave & { deleted: boolean })[]
}
