/* eslint-disable @typescript-eslint/no-unused-vars */

export function jsonSchema<T>(): JsonSchema<T> {
    throw new Error('Not meant to be called at runtime');
}

export type JsonSchema<T> = T extends any[] ? ArraySchema<T> : ObjectSchema<T>

type ArraySchema<T extends any[]> = {
    type: 'array',
    items: JsonSchema<T[number]>
};

type ObjectSchema<T extends Record<string, any>> = {
    type: 'object',
    properties: Properties<T>
};

type Properties<T> = {
    [K in keyof T]: PropertyType<T[K]>
}

type PropertyType<T> =
    T extends any[] | Record<string, any> ? JsonSchema<T>
    : { type: [keyof T] }

type PropertyTypeType<T> =
    T extends any[] | Record<string, any> ? JsonSchema<T>
    : T extends number ? 'number'
    : T extends string ? 'string'
    : T extends null ? 'null'
    : never;
