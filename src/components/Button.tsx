import { ComponentChildren, Fragment, h } from "preact";

type Props = h.JSX.HTMLAttributes<HTMLButtonElement> & {
  children?: ComponentChildren;
};

export default function Button({ children, ...attrs }: Props) {
  return (
    <button
      {...attrs}
      class="px-2 hover:shadow active:shadow-inner bg-slate-200 rounded border"
    >
      {children}
    </button>
  );
}
