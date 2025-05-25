import { SimpleOrganization } from "./simpleorganization";

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    organizations: SimpleOrganization[];
}