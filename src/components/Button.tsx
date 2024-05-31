import type { ComponentChildren, JSX } from "preact";
type Props = JSX.HTMLAttributes<HTMLButtonElement> & {
  children?: ComponentChildren;
};

export default function Button({ children, ...attrs }: Props) {
  return <button class="px-2 trigger" {...attrs}>{children}</button>;
}
