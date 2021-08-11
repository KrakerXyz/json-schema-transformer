import * as ts from 'typescript';
import { createProperty, Property } from './properties';

export function createEntity(typeChecker: ts.TypeChecker, node: ts.TypeNode): Entity {
    const type = typeChecker.getTypeFromTypeNode(node);
    const symbols = typeChecker.getPropertiesOfType(type);

    const properties = symbols.reduce((p, sym) => {
        const prop = createProperty(typeChecker, sym);
        return { ...p, [sym.name]: prop };
    }, {} as Entity['properties']);

    const name = type.aliasSymbol?.name;
    if (!name) { throw new Error('Could not get type argument type name'); }

    return {
        name,
        properties
    };
}

export interface Entity {
    name: string;
    properties: Record<string, Property>;
}