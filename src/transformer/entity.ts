import * as ts from 'typescript';
import { createProperty, Properties } from './properties';

export function createEntity(typeChecker: ts.TypeChecker, node: ts.TypeNode): Entity | [Entity] {

    if (ts.isArrayTypeNode(node)) {

        if (node.elementType.kind !== ts.SyntaxKind.LiteralType && node.elementType.kind !== ts.SyntaxKind.TypeReference) {
            throw new Error('Schema generation for non-object array types are not yet supported');
        }

        const type = typeChecker.getTypeFromTypeNode(node.elementType);
        const entity = getEntityFromType(typeChecker, type, node.elementType);
        return [entity];
    } else {
        const type = typeChecker.getTypeFromTypeNode(node);
        const entity = getEntityFromType(typeChecker, type, node);
        return entity;
    }

}

function getEntityFromType(typeChecker: ts.TypeChecker, type: ts.Type, node: ts.TypeNode): Entity {
    const symbols = typeChecker.getPropertiesOfType(type);

    const properties = symbols.reduce((p, sym) => {
        const prop = createProperty(typeChecker, sym);
        return { ...p, [sym.name]: prop };
    }, {} as Entity['properties']);

    const name = type.aliasSymbol?.name ?? (node as any).typeName?.text;
    if (!name) { throw new Error('Could not get type argument type name'); }

    return {
        name,
        properties
    };
}

export interface Entity {
    name: string;
    properties: Properties;
}