import { Grammars, Parser } from "ebnf";

const grammar = `
digit ::= '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  `;

const RULES = Grammars.W3C.getRules(grammar);

const parser = new Parser(RULES);
console.log(parser.getAST("1"));
