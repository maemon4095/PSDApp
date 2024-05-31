import type { ComponentChildren, h } from "preact";

type Props = {
  type: string;
  children?: ComponentChildren;
} & h.JSX.HTMLAttributes<HTMLInputElement>;

export default function TriggerInput({ children, ...attrs }: Props) {
  return (
    <label class="px-2 trigger">
      {children}
      <input
        {...attrs}
        hidden
      />
    </label>
  );
}
