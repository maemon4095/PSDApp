import { useEffect, useRef, useState } from "preact/hooks";
import { ComponentChildren, Fragment, h } from "preact";
import Partitioned from "~/components/Partitioned.tsx";
import ResizeBox from "./ResizeBox.tsx";

export default function App() {
  return (
    <div class="size-full flex flex-col items-stretch">
      <div class="flex-1 grid place-content-stretch">
        <ResizeBox>
          <Partitioned direction="column">
            <Partitioned direction="row">
              <div class="bg-blue-400" />
              <div class="bg-red-400" />
              <div class="bg-green-400" />
            </Partitioned>
            <div class="bg-yellow-400" />
          </Partitioned>
        </ResizeBox>
      </div>
    </div>
  );
}
