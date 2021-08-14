
import { jsonSchema } from '../../src';

export interface User {
    readonly id: string;
    name: string;
    description?: string | null;
    items: UserItem[];
}

export interface UserItem {
    foo: string;
    bar: string | number;
}

const test = jsonSchema<User>();
