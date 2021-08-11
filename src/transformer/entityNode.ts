import * as ts from 'typescript';
import { Entity } from './entity';
import { Property, PropertyValue, ValueType } from './properties';

export function createEntityNode(entity: Entity): ts.ObjectLiteralExpression {

    const typeEx = ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('object'));
    const propertiesEx = ts.factory.createPropertyAssignment('properties', createPropertiesExpression(entity.properties));

    const jsonSchemaEx = ts.factory.createObjectLiteralExpression([
        typeEx,
        propertiesEx
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

    const types: ts.Expression[] = [];

    for (const value of values) {
        switch (value.type) {
            case ValueType.Value: {
                types.push(
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral(value.value))
                    ])
                );
                break;
            }
        }
    }

    const typesArrayEx = ts.factory.createArrayLiteralExpression(types);
    const allOfProp = ts.factory.createPropertyAssignment('$allOf', typesArrayEx);
    const allOfExp = ts.factory.createObjectLiteralExpression([allOfProp]);
    return allOfExp;
}