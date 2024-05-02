import { ComponentChild, ComponentChildren, createContext, h } from "preact";
import { useState } from "preact/hooks";

type RegisterPopup = (
  popup: ComponentChild,
  handler?: PopupEventHandler,
) => void;
type PopupEvent = PopUpCancelEvent;
type PopupEventHandler = (e: PopupEvent) => void;

export const PopUp = createContext(
  (() => {}) as RegisterPopup,
);

export class PopUpCancelEvent extends Event {
  static override readonly name = "cancel";
  constructor() {
    super(PopUpCancelEvent.name, {
      cancelable: true,
    });
  }
}

export default function Layout({ children }: { children: ComponentChildren }) {
  const [popupPair, setPopup] = useState(
    undefined as undefined | [ComponentChild, PopupEventHandler | undefined],
  );

  const popup = popupPair && popupPair[0];
  const handler = popupPair && popupPair[1];

  return (
    <PopUp.Provider value={(e, h) => setPopup([e, h])}>
      <div class="size-full">
        {children}
        {popup != undefined
          ? (
            <Popup handler={handler} onClose={() => setPopup(undefined)}>
              {popup}
            </Popup>
          )
          : undefined}
      </div>
    </PopUp.Provider>
  );
}

function Popup(
  { children, handler, onClose }: {
    children: ComponentChild;
    handler?: PopupEventHandler;
    onClose: () => void;
  },
) {
  return (
    <div
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const event = new PopUpCancelEvent();
        handler?.(event);
        if (event.defaultPrevented) return;
        onClose();
      }}
      class="fixed top-0 left-0 size-full z-50 backdrop-blur backdrop-brightness-90 child-center"
    >
      {children}
    </div>
  );
}
