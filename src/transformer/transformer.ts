
import * as ts from 'typescript';
import { createEntity } from './entity';
import { createEntityNode } from './entityNode';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {

    const typeChecker = program.getTypeChecker();

    return (context: ts.TransformationContext) => {

        return (file: ts.SourceFile) => {

            const visit: ts.Visitor = (node): ts.Node => {

                if (!ts.isCallExpression(node)) { return ts.visitEachChild(node, (child) => visit(child), context); }
                if (node.expression.getText() !== 'jsonSchema') { return ts.visitEachChild(node, (child) => visit(child), context); }

                console.log(`Found jsonSchema() in ${file.fileName}`);
                if (node.typeArguments?.length !== 1) { throw new Error('Expecting one and only one type argument for jsonSchema()'); }

                const entity = createEntity(typeChecker, node.typeArguments[0]);

                const replacement = createEntityNode(entity);

                return replacement;

            };

            return ts.visitNode(file, visit);
        };
    };

}
