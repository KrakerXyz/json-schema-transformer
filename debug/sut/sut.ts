
import { jsonSchema } from '../../src';

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
