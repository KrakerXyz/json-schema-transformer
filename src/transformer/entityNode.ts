import * as ts from 'typescript';
import { Entity } from './entity';
import { Properties, Property, PropertyValue, ValueType, ValueValue } from './properties';

export function createEntityNode(entity: Entity): ts.ObjectLiteralExpression {

    const additionalPropertiesEx = ts.factory.createPropertyAssignment('additionalProperties', ts.factory.createFalse());

    const jsonSchemaEx = createObjectType(entity.properties, additionalPropertiesEx);



    return jsonSchemaEx;
}

function createObjectType(properties: Properties, ...additionalProperties: ts.PropertyAssignment[]): ts.ObjectLiteralExpression {
    const typeEx = ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('object'));
    const propertiesEx = ts.factory.createPropertyAssignment('properties', createPropertiesExpression(properties));

    const requiredNames = Object.entries(properties).filter(p => !p[1].isOptional && !p[1].values.some(v => v.type === ValueType.Null)).map(p => p[0]);
    const requiredEx = requiredNames.map(n => ts.factory.createStringLiteral(n));

    const requiredArrEx = ts.factory.createArrayLiteralExpression(requiredEx);
    const requiredPropEx = ts.factory.createPropertyAssignment('required', requiredArrEx);

    const jsonSchemaEx = ts.factory.createObjectLiteralExpression([
        typeEx,
        propertiesEx,
        requiredPropEx,
        ...additionalProperties
    ]);

    return jsonSchemaEx;
}

function createPropertiesExpression(properties: Entity['properties']): ts.ObjectLiteralExpression {

    const propExs: ts.ObjectLiteralElementLike[] = [];

    for (const key of Object.getOwnPropertyNames(properties)) {

        const property: Property = properties[key];

        propExs.push(ts.factory.createPropertyAssignment(key, createPropertyTypeExpression(property.values)));

    }

    return ts.factory.createObjectLiteralExpression(propExs);

}

function createPropertyTypeExpression(values: PropertyValue[]): ts.ObjectLiteralExpression {

    const types: ts.ObjectLiteralExpression[] = [];

    const valueTypes = values.filter(v => v.type === ValueType.Value) as ValueValue[];
    if (valueTypes.length) {
        const stringExs = valueTypes.map(t => ts.factory.createStringLiteral(t.value));

        if (values.some(t => t.type === ValueType.Null)) {
            stringExs.push(ts.factory.createStringLiteral('null'));
        }

        const arrEx = ts.factory.createArrayLiteralExpression(stringExs);
        types.push(ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment('type', arrEx)
        ]));
    }

    for (const value of values) {

        switch (value.type) {
            case ValueType.Object: {
                types.push(createObjectType(value.value));
                break;
            }
            case ValueType.Value: {
                // types.push(
                //     ts.factory.createObjectLiteralExpression([
                //         ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral(value.value))
                //     ])
                // );
                break;
            }
            case ValueType.Literal: {
                const literal: ts.Expression =
                    typeof value.value === 'string' ? ts.factory.createStringLiteral(value.value)
                        : value.value === true ? ts.factory.createTrue()
                            : value.value === false ? ts.factory.createFalse()
                                : ts.factory.createNumericLiteral(value.value);

                types.push(
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createPropertyAssignment('const', literal)
                    ])
                );
                break;
            }
            case ValueType.Null: {
                // types.push(
                //     ts.factory.createObjectLiteralExpression([
                //         ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('null'))
                //     ])
                // );
                break;
            }
            case ValueType.Any: {
                types.push(ts.factory.createObjectLiteralExpression([]));
                break;
            }
            default: {
                throw new Error(`Unexpected value type ${value.type}`);
            }
        }
    }

    if (types.length > 1) {
        const typesArrayEx = ts.factory.createArrayLiteralExpression(types);
        const allOfProp = ts.factory.createPropertyAssignment('anyOf', typesArrayEx);
        const allOfExp = ts.factory.createObjectLiteralExpression([allOfProp]);
        return allOfExp;
    }

    return types[0];
}