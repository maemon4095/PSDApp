import type { ComponentChildren, h } from "preact";
type Props = h.JSX.HTMLAttributes<HTMLButtonElement> & {
  children?: ComponentChildren;
};

export default function Button({ children, ...attrs }: Props) {
  return <button class="px-2 trigger" {...attrs}>{children}</button>;
}
