
# 0.1.1 (2021-11-29)
- Fixed issue generating schema where the root type is an alias (union) of two or more types (`Combined`).
- Check for property type references a specific enum value and treat these as constants (`foo: Foo.Bar`).
 
Example
```typescript
enum Foo {
    Bar = 'bar',
    Fizz = 'fizz'
}

interface Type1 {
    foo: Foo.Bar;
    extra: string;
}

interface Type2 {
    foo: Foo.Fizz;
    extra2: string;
}

type Combined = Type1 | Type2;

const _ = jsonSchema<Combined>();
```