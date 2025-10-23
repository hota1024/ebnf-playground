import { Grammars, Parser } from "ebnf";

let grammar = `
digit ::= '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  `;

let RULES = Grammars.W3C.getRules(grammar);

let parser = new Parser(RULES);
console.log(parser.getAST("1"));
