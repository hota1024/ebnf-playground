"use client";

import Editor, { useMonaco } from "@monaco-editor/react";
import { Grammars, type IRule, type IToken } from "ebnf";
import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { type editor, Range } from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback, useLocalStorage, useCopyToClipboard } from "usehooks-ts";
import { initializeMonacoEbnf } from "@/lib/monaco-ebnf";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function Playground({
  grammar,
  input,
  setGrammar,
  setInput,
}: {
  grammar: string;
  input: string;
  setGrammar: (grammar: string) => void;
  setInput: (input: string) => void;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const monaco = useMonaco();
  const [fontSize, setFontSize] = useLocalStorage("ebnf-playground-font-size", 20);
  const [grammarType, setGrammarType] = useLocalStorage<
    "W3C" | "BNF" | "Custom"
  >("grammar-type", "W3C");
  const [grammarError, setGrammarError] = useState<string | null>(null);
  const [rules, setRules] = useState<IRule[]>([]);
  const [ast, setAst] = useState<IToken | null>(null);
  const [matched, setMatched] = useState<boolean>(false);
  const [_grammarEditor, setGrammarEditor] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [inputEditor, setInputEditor] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  
  const [copied, copy] = useCopyToClipboard();

  const setGrammarDebounced = useDebounceCallback(setGrammar, 500);
  const setInputDebounced = useDebounceCallback(setInput, 500);

  useEffect(() => {
    setMatched(false);
    setGrammarError(null);

    if (!inputEditor) {
      return;
    }

    try {
      const parser = new Grammars[grammarType].Parser(`${grammar}\n`);
      const rules = parser.grammarRules;
      const ast = parser.getAST(input);
      if (ast) {
        setMatched(true);
        setAst(ast);
        setRules(rules);

        if (ast.rest.length === 0) {
          return;
        }

        const restStart = inputEditor?.getModel()?.getPositionAt(ast.end);
        const restEnd = inputEditor
          ?.getModel()
          ?.getPositionAt(ast.end + ast.rest.length);

        if (restStart && restEnd) {
          const model = inputEditor?.getModel();
          if (!model) {
            return;
          }
          monaco?.editor.setModelMarkers(model, "owner", [
            {
              severity: monaco.MarkerSeverity.Error,
              message: `Rest of the input: ${ast.rest}`,
              startLineNumber: restStart.lineNumber,
              startColumn: restStart.column,
              endLineNumber: restEnd.lineNumber,
              endColumn: restEnd.column,
            },
          ]);

          return () => {
            const model = inputEditor?.getModel();
            if (!model) {
              return;
            }
            monaco?.editor.setModelMarkers(model, "owner", []);
          };
        }
      }
    } catch (e) {
      setGrammarError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [
    grammar,
    input,
    grammarType,
    inputEditor,
    monaco?.editor.setModelMarkers,
    monaco?.MarkerSeverity.Error,
  ]);

  return (
    <ResizablePanelGroup className="min-h-dvh" direction="vertical">
      <ResizablePanel defaultSize={50}>
        <div className="grid grid-rows-[auto_1fr] h-full gap-2">
          <div className="px-8 py-4 border-b bg-muted/25 flex items-center gap-2">
            <div className="text-lg font-semibold">Grammar</div>
            <Select
              value={grammarType}
              onValueChange={(value) =>
                setGrammarType(value as "W3C" | "BNF" | "Custom")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a grammar type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="W3C">W3C</SelectItem>
                <SelectItem value="BNF">BNF</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <div className="grow" />
            <div className="flex gap-2 items-center">
              <InputGroup className="w-40">
                <InputGroupInput
                  className="text-right"
                  placeholder="Font Size"
                  value={fontSize.toString()}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
                <InputGroupAddon>Font size</InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton>px</InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <Select
                value={theme ?? resolvedTheme}
                onValueChange={(value) =>
                  setTheme(value as "dark" | "light" | "system")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => {
                copy(`${window.location.origin}?grammar=${encodeURIComponent(grammar)}&input=${encodeURIComponent(input)}`);
                toast.success("Copied to clipboard");
              }}>
                <CopyIcon/>
                Share URL
              </Button>
            </div>
          </div>
          <Editor
            defaultLanguage="ebnf"
            options={{
              fontSize,
              minimap: {
                enabled: false,
              },
            }}
            theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
            onMount={(editor, monaco) => {
              initializeMonacoEbnf(monaco);
              setGrammarEditor(editor);
            }}
            value={grammar}
            onChange={(value) => setGrammarDebounced(value ?? "")}
          />
          {grammarError ? (
            <div className="px-8 h-8 flex items-center">
              <div className="text-sm text-destructive">{grammarError}</div>
            </div>
          ) : (
            <div className="px-8 h-8 border-t flex gap-2 items-center">
              <div className="text-xs text-muted-foreground">
                {rules.length} rules
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {rules
                  .filter((r) => !r.fragment)
                  .map((r) => (
                    <div
                      className="text-xs text-muted-foreground bg-muted/50 px-2 rounded-md"
                      key={r.name}
                    >
                      {r.name}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>
            <div className="grid grid-rows-[auto_1fr] h-full gap-2">
              <div className="px-8 py-4 border-b bg-muted/25 flex items-center justify-between">
                <div className="text-lg font-semibold ">Matching Test</div>

                {matched ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 text-white dark:bg-green-600"
                  >
                    <CheckIcon />
                    Matched
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XIcon />
                    Not matched
                  </Badge>
                )}
              </div>
              <Editor
                options={{
                  fontSize,
                  minimap: {
                    enabled: false,
                  },
                }}
                theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
                onMount={(editor) => {
                  setInputEditor(editor);
                }}
                value={input}
                onChange={(value) => setInputDebounced(value ?? "")}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="grid grid-rows-[auto_1fr] h-full gap-2">
              <div className="px-8 py-4 text-lg font-semibold border-b bg-muted/25">
                Abstract Syntax Tree (AST)
              </div>
              <div className="px-8 py-4">
                {ast && <Tree token={ast} inputEditor={inputEditor} />}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function Tree({
  token,
  inputEditor,
}: {
  token: IToken;
  inputEditor: editor.IStandaloneCodeEditor | null;
}) {
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(
    null,
  );

  if (!inputEditor) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className={cn(
          "flex items-end hover:bg-blue-500/50 gap-4 p-2",
          token.children.length > 0 ? "border" : "border-l border-r border-b",
        )}
        onMouseEnter={() => {
          const start = inputEditor.getModel()?.getPositionAt(token.start);
          const end = inputEditor.getModel()?.getPositionAt(token.end);

          if (!start || !end) {
            return;
          }
          decorationsRef.current = inputEditor.createDecorationsCollection([
            {
              range: Range.fromPositions(start, end),
              options: {
                inlineClassName: "ast-node-decoration",
              },
            },
          ]);
        }}
        onMouseLeave={() => {
          // inputEditor.getModel()?.getLineContent(token.start);
          decorationsRef.current?.clear();
        }}
      >
        <div className="font-bold">{token.type}</div>
        <div className="text-muted-foreground text-sm">{token.text}</div>
      </button>
      <div className="pl-4 flex flex-col">
        {token.children.map((child) => (
          <Tree key={child.start} token={child} inputEditor={inputEditor} />
        ))}
      </div>
    </div>
  );
}
