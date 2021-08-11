
import * as ts from 'typescript';

export default function transformer(_program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
   return (context: ts.TransformationContext) => {

      const visit: ts.Visitor = (node): ts.Node => {

          if (ts.isNewExpression(node) && node.expression.getText() === 'TypedEntity') {
             
              return node;

            //If the user gave an explicit config, don't overwrite them
            // if (node.arguments?.length) {
            //    return node;
            // }

            // const typedEntityNode = TypedEntityNode.create(node, program.getTypeChecker(), config);
            // const newNode = typedEntityNode.getNode();
            // return newNode;

         }

         return ts.visitEachChild(node, (child) => visit(child), context);

      };

      return (file: ts.SourceFile) => ts.visitNode(file, visit);
   };

}
