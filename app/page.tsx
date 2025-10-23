"use client";
import dynamic from "next/dynamic";

const Playground = dynamic(
  () => import("../components/playground").then((mod) => mod.Playground),
  {
    ssr: false,
  },
);

export default function Home() {
  return <Playground />;
}
