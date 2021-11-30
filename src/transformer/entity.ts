import * as ts from 'typescript';
import { createProperty, Properties } from './properties';

export function createEntity(typeChecker: ts.TypeChecker, node: ts.TypeNode): Entity | [Entity] | [Entity[]] {

    if (ts.isArrayTypeNode(node)) {

        if (node.elementType.kind !== ts.SyntaxKind.LiteralType && node.elementType.kind !== ts.SyntaxKind.TypeReference) {
            throw new Error('Schema generation for non-object array types are not yet supported');
        }

        const type = typeChecker.getTypeFromTypeNode(node.elementType);
        const entity = getEntityFromType(typeChecker, type);
        return [entity];
    } else {
        const type = typeChecker.getTypeFromTypeNode(node);

        if (type.isUnion()) {
            const types = type.types;
            const unionEntities = types.map(t => getEntityFromType(typeChecker, t));
            return [unionEntities];
        }

        const entity = getEntityFromType(typeChecker, type);
        return entity;
    }

}

function getEntityFromType(typeChecker: ts.TypeChecker, type: ts.Type): Entity {
    const symbols = typeChecker.getPropertiesOfType(type);

    const properties = symbols.reduce((p, sym) => {
        const prop = createProperty(typeChecker, sym);
        return { ...p, [sym.name]: prop };
    }, {} as Entity['properties']);

    return {
        properties
    };
}

export interface Entity {
    properties: Properties;
}