import { Monaco } from "@monaco-editor/react";
import gitHubLight from "monaco-themes/themes/GitHub Light.json";
import gitHubDark from "monaco-themes/themes/GitHub Dark.json";

export function initializeMonacoEbnf(monaco: Monaco) {
  // monaco.editor.defineTheme("vs", gitHubLight);
  // monaco.editor.defineTheme("vs-dark", gitHubDark);

  // EBNF言語の定義
  monaco.languages.register({ id: "ebnf" });

  // EBNFのトークナイザー定義
  monaco.languages.setMonarchTokensProvider("ebnf", {
    defaultToken: "",
    tokenPostfix: ".ebnf",

    // キーワードと演算子
    operators: ["=", "|", ",", ";", "-"],

    // エスケープシーケンス
    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // トークナイザーのメインルール
    tokenizer: {
      root: [
        // ルール名（識別子）の定義部分
        [/^[a-zA-Z_]\w*(?=\s*=)/, "type.identifier"],

        // コメント
        [/\(\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],

        // 文字列（終端記号）
        [/"([^"\\]|\\.)*$/, "string.invalid"], // 閉じられていない文字列
        [/'([^'\\]|\\.)*$/, "string.invalid"], // 閉じられていない文字列
        [/"/, "string", "@string_double"],
        [/'/, "string", "@string_single"],

        // 特殊な演算子と区切り文字
        [/[{}()\[\]]/, "@brackets"],
        [/[;]/, "delimiter.semicolon"],
        [/[,]/, "delimiter.comma"],
        [/\|/, "operator.or"],
        [/=/, "operator.assign"],
        [/-/, "operator"],

        // 繰り返し演算子
        [/\{/, "keyword.operator", "@repetition"],

        // オプション演算子
        [/\[/, "keyword.operator", "@optional"],

        // ルール参照（識別子）
        [/[a-zA-Z_]\w*/, "variable.name"],

        // 空白
        [/[ \t\r\n]+/, ""],

        // 数値（特殊な場合）
        [/\d+/, "number"],
      ],

      // コメント処理
      comment: [
        [/[^*(]+/, "comment"],
        [/\*\)/, "comment", "@pop"],
        [/\*/, "comment"],
        [/\(/, "comment"],
      ],

      // ダブルクォート文字列
      string_double: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"],
      ],

      // シングルクォート文字列
      string_single: [
        [/[^\\']+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/'/, "string", "@pop"],
      ],

      // 繰り返し { }
      repetition: [[/\}/, "keyword.operator", "@pop"], { include: "root" }],

      // オプション [ ]
      optional: [[/\]/, "keyword.operator", "@pop"], { include: "root" }],
    },
  });

  // EBNFの言語設定
  monaco.languages.setLanguageConfiguration("ebnf", {
    comments: {
      lineComment: "//",
      blockComment: ["(*", "*)"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "(*", close: "*)" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  // カスタムテーマの定義（EBNFに最適化）
  monaco.editor.defineTheme("vs", {
    base: "vs",
    inherit: true,
    rules: [
      {
        token: "type.identifier",
        foreground: "0000FF",
        fontStyle: "bold",
      },
      { token: "variable.name", foreground: "001080" },
      { token: "string", foreground: "A31515" },
      { token: "string.escape", foreground: "FF0000" },
      { token: "comment", foreground: "008000", fontStyle: "italic" },
      {
        token: "operator.assign",
        foreground: "000000",
        fontStyle: "bold",
      },
      { token: "operator.or", foreground: "FF6600", fontStyle: "bold" },
      { token: "operator", foreground: "666666" },
      {
        token: "delimiter.semicolon",
        foreground: "000000",
        fontStyle: "bold",
      },
      { token: "delimiter.comma", foreground: "000000" },
      {
        token: "keyword.operator",
        foreground: "7F0055",
        fontStyle: "bold",
      },
      { token: "number", foreground: "098658" },
    ],
    colors: {
      "editor.background": "#f9f9f9",
    },
  });
  monaco.editor.defineTheme("vs-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "type.identifier", foreground: "4EC9B0", fontStyle: "bold" },
      { token: "variable.name", foreground: "9CDCFE" },
      { token: "string", foreground: "CE9178" },
      { token: "string.escape", foreground: "D7BA7D" },
      { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      { token: "operator.assign", foreground: "D4D4D4", fontStyle: "bold" },
      { token: "operator.or", foreground: "C586C0", fontStyle: "bold" },
      { token: "operator", foreground: "D4D4D4" },
      { token: "delimiter.semicolon", foreground: "D4D4D4", fontStyle: "bold" },
      { token: "delimiter.comma", foreground: "D4D4D4" },
      { token: "keyword.operator", foreground: "569CD6", fontStyle: "bold" },
      { token: "number", foreground: "B5CEA8" },
    ],
    colors: {
      "editor.background": "#111111",
    },
  });
}
