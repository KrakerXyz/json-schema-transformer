
import { jsonSchema } from '../../src';


export interface User {
    readonly id: string;
    readonly email: string | null;
    readonly created: number;
    /** Time stamp of the last time a authenticated service was used. Could be off by 15 minutes. */
    readonly lastSeen: number;
}

const _ = jsonSchema<string[]>();
