import { Fragment, h } from "preact";
import { switcher } from "~/App.tsx";
import { getPsdStructure, init, PsdStructure } from "~/lib/psd.ts";
import { useEffect } from "preact/hooks";

export default function PSDView({ structure }: { structure: PsdStructure }) {
  return (
    <div class="size-full">
    </div>
  );
}

function PsdStrucutureView({ structure }: { structure: PsdStructure }) {
}
