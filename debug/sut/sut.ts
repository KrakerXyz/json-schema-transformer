
import { jsonSchema } from '../../src';

export interface User {
    readonly id: [string, ...string[]];
}

const _ = jsonSchema<User>();
