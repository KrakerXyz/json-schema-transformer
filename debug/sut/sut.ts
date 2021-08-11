
import { jsonSchema } from '../../src';

type ObjectTest = {
    id: number;
    name: string;
    description: string | null;
}

type ArrayTest = ObjectTest[];

const objectTestSchema = jsonSchema<ObjectTest>();
const arrayTestSchema = jsonSchema<ArrayTest>();

objectTestSchema.properties.description.type

console.log({ objectTestSchema, arrayTestSchema });