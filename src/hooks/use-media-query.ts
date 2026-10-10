import { useSyncExternalStore } from "react";

/** Keep in sync with the `max-width: 767px` media queries in the component CSS. */
export const NARROW_QUERY = "(max-width: 767px)";

export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches
  );
