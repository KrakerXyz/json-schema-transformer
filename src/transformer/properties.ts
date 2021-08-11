

import * as ts from 'typescript';

export function createProperty(typeChecker: ts.TypeChecker, symbol: ts.Symbol): Property {

    const fullName = `${(symbol as any).parent?.name}.${symbol.name}`;

    if (!symbol.declarations?.length) { throw new Error(`Symbol does not have any declarations (${fullName})`); }
    if (symbol.declarations.length > 1) { throw new Error(`More than one declaration for symbol was unexpected (${fullName})`); }

    const declaration = symbol.declarations[0];
    if (!ts.isPropertySignature(declaration)) { throw new Error(`Declaration for symbol was not a PropertyDeclaration (${fullName})`); }
    return {
        isOptional: !!declaration.questionToken,
        values: getType(fullName, declaration.type!, typeChecker)
    };

}

// eslint-disable-next-line complexity
function getType(fullName: string, t: ts.TypeNode, typeChecker: ts.TypeChecker): PropertyValue[] {

    switch (t.kind) {
        case ts.SyntaxKind.NumberKeyword: return [{
            type: ValueType.Value,
            value: 'number'
        }];
        case ts.SyntaxKind.StringKeyword: return [{
            type: ValueType.Value,
            value: 'string'
        }];
        case ts.SyntaxKind.BooleanKeyword: return [{
            type: ValueType.Value,
            value: 'boolean'
        }];
        case ts.SyntaxKind.LiteralType: {
            const children = t.getChildren();
            if (!children.length || children.length > 1) { throw new Error(`Unexpected number of children for Literal (${fullName})`); }

            const child = children[0];
            switch (child.kind) {
                case ts.SyntaxKind.NullKeyword: {
                    return [{
                        type: ValueType.Null
                    }];
                }
                case ts.SyntaxKind.StringLiteral: {

                    return [{
                        type: ValueType.Literal,
                        value: (child as ts.StringLiteral).text
                    }];

                }
                case ts.SyntaxKind.NumericLiteral: {
                    return [{
                        type: ValueType.Literal,
                        value: parseFloat((child as ts.NumericLiteral).text)
                    }];
                }
                case ts.SyntaxKind.FalseKeyword: {
                    return [{
                        type: ValueType.Literal,
                        value: false
                    }];
                }
                case ts.SyntaxKind.TrueKeyword: {
                    return [{
                        type: ValueType.Literal,
                        value: true
                    }];
                }
                default: {
                    throw new Error(`Unknown Literal child kind ${ts.SyntaxKind[child.kind]} (${fullName})`);
                }
            }
        }
        case ts.SyntaxKind.TypeReference:
        case ts.SyntaxKind.TypeLiteral: {

            const refType = t as ts.TypeReferenceNode;
            const type = typeChecker.getTypeFromTypeNode(refType);

            const enumDecl = (type.aliasSymbol?.declarations ?? [])[0];
            if (enumDecl && ts.isEnumDeclaration(enumDecl)) {
                const members = enumDecl.members;
                const values: LiteralValue[] = members.map((m, i) => {

                    if (!m.initializer) {
                        return {
                            type: ValueType.Literal,
                            value: i
                        };
                    }

                    if (ts.isStringLiteral(m.initializer)) {
                        return {
                            type: ValueType.Literal,
                            value: m.initializer?.text ?? i
                        };
                    }

                    throw new Error(`Unknown initializer type for enum of ${fullName}`);
                });
                return values;
            }

            if (refType.typeName?.getText() === 'Record') {
                return [{ type: ValueType.Any }];
            }

            const typeProperties = typeChecker.getPropertiesOfType(type);
            const fields = typeProperties.map(s => createProperty(typeChecker, s));
            const fieldConfig = fields.reduce((prev, cur) => ({ ...prev, ...cur }), {} as Property);

            return [{
                type: ValueType.Object,
                value: fieldConfig
            }];

        }
        case ts.SyntaxKind.ArrayType: {
            const elementType = (t as ts.ArrayTypeNode).elementType;
            const elementFieldValues = getType(fullName, elementType, typeChecker);
            return [{
                type: ValueType.Array,
                value: elementFieldValues
            }];
        }
        case ts.SyntaxKind.ParenthesizedType: {
            const innerType = (t as ts.ParenthesizedTypeNode).type;
            const typeFieldValues = getType(fullName, innerType, typeChecker);
            return typeFieldValues;
        }
        case ts.SyntaxKind.UnionType: {
            const unionTypeFields = (t as ts.UnionTypeNode).types.map(t => getType(fullName, t, typeChecker));
            return unionTypeFields.flatMap(t => t);
        }
        default: throw new Error(`Property type ${ts.SyntaxKind[t.kind]} for ${fullName} not supported`);
    }
}


export type Property = { isOptional: boolean, values: PropertyValue[] }

export type PropertyValue = LiteralValue | ObjectValue | ValueValue | ArrayValue | NullValue | AnyValue;

export enum ValueType {
    Null = 'nil',
    Value = 'val',
    Literal = 'lit',
    Object = 'obj',
    Array = 'arr',
    Any = 'any'
}

export interface NullValue {
    type: ValueType.Null;
}

export interface AnyValue {
    type: ValueType.Any;
}

export interface ValueValue {
    type: ValueType.Value;
    value: 'number' | 'string' | 'boolean';
}

/** Represents a set of literal values that are acceptable for a field. A typical use case if for enum values where the values list would be a number for each index of the enum */
export interface LiteralValue {
    type: ValueType.Literal;
    value: number | string | boolean;
}

export interface ObjectValue {
    type: ValueType.Object;
    value: Property;
}

export interface ArrayValue {
    type: ValueType.Array;
    value: PropertyValue[]
}