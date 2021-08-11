
import { jsonSchema } from '../../src';

type ObjectTest = {
    id: number | string | null;
    name: string;
    description: string | null;
    setup: {
        test: string;
    }
}


const objectTestSchema = jsonSchema<ObjectTest>();

objectTestSchema.properties.id;
objectTestSchema.properties.name;
objectTestSchema.properties.description;
objectTestSchema.properties.setup.$oneOf[0].properties.test;

console.log({ objectTestSchema });

/*
type ArrayTest = ObjectTest[];
//const arrayTestSchema = jsonSchema<ArrayTest>();
*/