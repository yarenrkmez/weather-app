import {
  MutableRefObject,
  RefCallback,
  useCallback,
  useEffect,
  useRef,
} from "react";

type Params = {
  hasMore: boolean;
  onLoadMore: () => void;
  root?: MutableRefObject<Element | null> | null;
  rootMargin?: string;
  threshold?: number | number[]; // 0..1
  disabled?: boolean;
};

export function useInfiniteScroll({
  hasMore,
  onLoadMore,
  root = null,
  rootMargin = "0px 0px 48px 0px",
  threshold = 0,
  disabled = false,
}: Params) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelElRef = useRef<Element | null>(null);

  const setSentinelRef: RefCallback<Element> = useCallback((node) => {
    sentinelElRef.current = node;
  }, []);

  useEffect(() => {
    if (disabled || !hasMore) return;
    const target = sentinelElRef.current;
    if (!target) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) onLoadMore();
      },
      {
        root: root?.current ?? null,
        rootMargin,
        threshold,
      }
    );

    observerRef.current = io;
    io.observe(target);

    return () => {
      io.disconnect();
      observerRef.current = null;
    };
  }, [disabled, hasMore, onLoadMore, root, rootMargin, threshold]);

  return { setSentinelRef };
}
