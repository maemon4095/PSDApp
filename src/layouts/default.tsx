import {
  type ComponentChild,
  type ComponentChildren,
  createContext,
} from "preact";
import { useMemo, useState } from "preact/hooks";

type PopupEvent = PopUpCancelEvent;
type PopupEventListener = (e: PopupEvent) => void;

export const DefaultLayoutContext = createContext(
  undefined as unknown as DefaultLayoutContext,
);

export type DefaultLayoutContext = {
  setPopup(popup: ComponentChild, listener?: PopupEventListener): void;
};

export class PopUpCancelEvent extends Event {
  static override readonly name = "cancel";
  constructor() {
    super(PopUpCancelEvent.name, {
      cancelable: true,
    });
  }
}

export default function Layout({ children }: { children: ComponentChildren }) {
  const [popupPair, setPopupPair] = useState(
    undefined as undefined | [ComponentChild, PopupEventListener | undefined],
  );

  const context: DefaultLayoutContext = useMemo(() => {
    return {
      setPopup(popup, listener) {
        setPopupPair([popup, listener]);
      },
    };
  }, []);

  const popup = popupPair && popupPair[0];
  const listener = popupPair && popupPair[1];

  return (
    <DefaultLayoutContext.Provider value={context}>
      <div class="size-full">
        {children}
        <Popup handler={listener} onClose={() => setPopupPair(undefined)}>
          {popup}
        </Popup>
      </div>
    </DefaultLayoutContext.Provider>
  );
}

function Popup(
  { children, handler, onClose }: {
    children?: ComponentChild;
    handler?: PopupEventListener;
    onClose: () => void;
  },
) {
  if (children === undefined || children === null) {
    // deno-lint-ignore jsx-no-useless-fragment
    return <></>;
  }

  return (
    <div
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const event = new PopUpCancelEvent();
        handler?.(event);
        if (event.defaultPrevented) return;
        onClose();
      }}
      class="fixed top-0 left-0 size-full z-50 backdrop-blur child-center backdrop-brightness-95"
    >
      {children}
    </div>
  );
}
