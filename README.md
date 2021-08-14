
# json-schema-transformer
This TypeScript transformer will look for references to `jsonSchema<SomeType>()` in code and replace it with the [JSON Schema](https://json-schema.org/) for SomeType.

I created this project after experimenting with [Fastify](https://www.fastify.io/). I learned that it has built in [Ajv](https://ajv.js.org/) validator support which utilizes JSON Schema for the validation rules.

There's something about writing a TypeScript interface then also manually writing JSON Schema that doesn't seem DRY to me. I wanted to be able to write my interfaces then have the JSON Schema generated automatically, igitur, json-schema-transformer.

### Example TypeScript
```typescript
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

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
```

### Compiled JS
```javascript
const test = { 
    type: "object", 
    properties: { 
        id: { type: ["string"] }, 
        name: { type: ["string"] }, 
        description: { type: ["string", "null"] }, 
        items: { 
            type: "array", 
            items: { 
                type: "object", 
                properties: { 
                    foo: { type: ["string"] }, 
                    bar: { type: ["string", "number"] } 
                }, 
                required: ["foo", "bar"], 
                additionalProperties: false 
            } 
        } 
    }, 
    required: ["id", "name", "items"], 
    additionalProperties: false 
};
```

# Warning
This library was developed as a proof-of-concept and type support is not robust enough for general public to use. Expect bugs.

If you have interest in something like this for your project, adding a watch or star on GitHub will motivate me to polish it for general release.

# Installation

```bash
npm install @krakerxyz/json-schema-transformer
```

We now need to tell TypeScript it needs to run it. Unfortunately, registering the transformer through tsconfig.json is not natively supported. [ttypescript](https://www.npmjs.com/package/ttypescript) to the rescue.

```bash
npm install ttypescript --save-dev
```

TTypescript will read the transformers to use from tsconfig.json
```json
{
    "compilerOptions": {
        ...
        "plugins": [
            {
                "transform": "@krakerxyz/json-schema-transformer/dist/cjs/transformer/transformer"
            }
        ]
    }
}
```

We now use ttypescript to invoke our builds. In our package.json, we'll use a script similar to
```json
{
    "scripts": {
        "build": "ttsc"
    }
}
```

# Usage

Simply import jsonSchema from @krakerxyz/json-schema-transformer and then make a call to it, passing your interface/type in as the type argument. The transformer will find calls to jsonSchema<Type>() and replace "jsonSchema<Type>()" with the JSON Schema markup.

### Example usage within a Fastify handler
```typescript
import { RouteOptions } from 'fastify';
import { MyPostBody } from '../types';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

export const apiHandler: RouteOptions = {
    method: 'POST',
    url: '/api',
    schema: {
        body: jsonSchema<MyPostBody>())
    },
    handler: async (req, res) => {
        const postBody = req.body as MyPostBody;
    }
}
```


