import { useCallback, useState } from "react";

/**
 * Tracks Caps Lock state from a keyboard event handler.
 * Attach the returned `onKey` to both onKeyDown and onKeyUp of the input.
 */
export function useCapsLock() {
  const [capsOn, setCapsOn] = useState(false);

  const onKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  }, []);

  return { capsOn, onKey };
}
