"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useLocalStorage } from "usehooks-ts";

const Playground = dynamic(
  () => import("../components/playground").then((mod) => mod.Playground),
  {
    ssr: false,
  },
);

const defaultGrammar = `
digit ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"\n
`.trim();
const defaultInput = `
1
`.trim();

export default function Home() {
  const query = useSearchParams();

  if (query.has("grammar") || query.has("input")) {
    return <PlaygroundWithQueryParams />;
  }

  return <PlaygroundWithLocalStorage />;
}

function PlaygroundWithLocalStorage() {
  const [grammar, setGrammar] = useLocalStorage(
    "ebnf-playground-grammar",
    defaultGrammar,
  );
  const [input, setInput] = useLocalStorage(
    "ebnf-playground-input",
    defaultInput,
  );

  return (
    <Playground
      grammar={grammar}
      input={input}
      setGrammar={setGrammar}
      setInput={setInput}
    />
  );
}

function PlaygroundWithQueryParams() {
  const [grammar, setGrammar] = useQueryState(
    "grammar",
    parseAsString.withDefault(""),
  );
  const [input, setInput] = useQueryState(
    "input",
    parseAsString.withDefault(""),
  );

  return (
    <Playground
      grammar={grammar}
      input={input}
      setGrammar={setGrammar}
      setInput={setInput}
    />
  );
}
