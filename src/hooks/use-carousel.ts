"use client";

import {
  FocusEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";

export interface CarouselState {
  index: number;
  status: "playing" | "paused";
}

export type CarouselAction =
  | { type: "NEXT"; count: number }
  | { type: "PREV"; count: number }
  | { type: "GO_TO"; index: number; count: number }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "CLAMP"; count: number };

/**
 * Pure state machine reducer for carousel and auto-rotating content.
 * Guarantees `index` is always in `[0, Math.max(0, count - 1)]`.
 */
export function carouselReducer(
  state: CarouselState,
  action: CarouselAction,
): CarouselState {
  switch (action.type) {
    case "NEXT": {
      if (action.count <= 0) return { ...state, index: 0 };
      return {
        ...state,
        index: (state.index + 1) % action.count,
      };
    }
    case "PREV": {
      if (action.count <= 0) return { ...state, index: 0 };
      return {
        ...state,
        index: (state.index - 1 + action.count) % action.count,
      };
    }
    case "GO_TO": {
      if (action.count <= 0) return { ...state, index: 0 };
      const clamped = Math.max(0, Math.min(action.index, action.count - 1));
      return { ...state, index: clamped };
    }
    case "PAUSE":
      return state.status === "paused" ? state : { ...state, status: "paused" };
    case "RESUME":
      return state.status === "playing"
        ? state
        : { ...state, status: "playing" };
    case "CLAMP": {
      if (action.count <= 0) return { ...state, index: 0 };
      if (state.index >= action.count) {
        return { ...state, index: 0 };
      }
      return state;
    }
  }
}

export interface UseCarouselOptions {
  /** Number of items in the carousel. */
  count: number;
  /** Duration in ms per slide (single number or per-slide array). */
  durations: number | number[];
  /** Called whenever the active slide index changes via user action or timer. */
  onTransition?: (index: number) => void;
  /** Pause auto-advance when user prefers reduced motion (default: true). */
  respectReducedMotion?: boolean;
}

/**
 * Explicit state-machine hook for auto-advancing carousels and rotating items.
 * Handles boundary clamping, timer cleanup, pause-on-hover/focus, and reduced motion.
 */
export function useCarousel({
  count,
  durations,
  onTransition,
  respectReducedMotion = true,
}: UseCarouselOptions) {
  const [state, dispatch] = useReducer(carouselReducer, {
    index: 0,
    status: "playing",
  });

  const onTransitionRef = useRef(onTransition);
  onTransitionRef.current = onTransition;

  // Keep index valid if the item count shrinks dynamically
  useEffect(() => {
    dispatch({ type: "CLAMP", count });
  }, [count]);

  const next = useCallback(() => {
    if (count <= 0) return;
    const nextIndex = (state.index + 1) % count;
    dispatch({ type: "NEXT", count });
    onTransitionRef.current?.(nextIndex);
  }, [count, state.index]);

  const prev = useCallback(() => {
    if (count <= 0) return;
    const prevIndex = (state.index - 1 + count) % count;
    dispatch({ type: "PREV", count });
    onTransitionRef.current?.(prevIndex);
  }, [count, state.index]);

  const goTo = useCallback(
    (index: number) => {
      if (count <= 0) return;
      const clamped = Math.max(0, Math.min(index, count - 1));
      dispatch({ type: "GO_TO", index: clamped, count });
      onTransitionRef.current?.(clamped);
    },
    [count],
  );

  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), []);

  const currentDuration = Array.isArray(durations)
    ? (durations[state.index] ?? durations[0] ?? 5000)
    : durations;

  useEffect(() => {
    if (count <= 1 || state.status === "paused") return;

    if (
      respectReducedMotion &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const nextIndex = (state.index + 1) % count;
      dispatch({ type: "NEXT", count });
      onTransitionRef.current?.(nextIndex);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [count, currentDuration, respectReducedMotion, state.index, state.status]);

  return {
    currentIndex: state.index,
    status: state.status,
    next,
    prev,
    goTo,
    pause,
    resume,
    containerProps: {
      onMouseEnter: pause,
      onMouseLeave: resume,
      onFocus: pause,
      onBlur: resume,
    },
    getContainerProps: <T extends HTMLElement>(handlers?: {
      onMouseEnter?: MouseEventHandler<T>;
      onMouseLeave?: MouseEventHandler<T>;
      onFocus?: FocusEventHandler<T>;
      onBlur?: FocusEventHandler<T>;
    }) => ({
      onMouseEnter: (event: React.MouseEvent<T>) => {
        pause();
        handlers?.onMouseEnter?.(event);
      },
      onMouseLeave: (event: React.MouseEvent<T>) => {
        resume();
        handlers?.onMouseLeave?.(event);
      },
      onFocus: (event: React.FocusEvent<T>) => {
        pause();
        handlers?.onFocus?.(event);
      },
      onBlur: (event: React.FocusEvent<T>) => {
        resume();
        handlers?.onBlur?.(event);
      },
    }),
  };
}
