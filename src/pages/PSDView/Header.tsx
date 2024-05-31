import type { ComponentChildren } from "preact";

export default function Header({ children }: { children: ComponentChildren }) {
  return (
    <header class="shadow z-10 p-1 h-10 border-b flex flex-row items-center gap-1">
      {children}
    </header>
  );
}
