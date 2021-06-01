import { LinkToSave } from "../link/types";
import { UserWithHashedPassword } from "../user/types";

export type SeedData = {
    users: (UserWithHashedPassword & { deactivated: boolean })[]
    links:  (LinkToSave & { deleted: boolean })[]
}
