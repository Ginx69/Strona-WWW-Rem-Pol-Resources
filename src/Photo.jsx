import { resolveMediaUrl } from "./mediaUrl";
import React, { useRef, useEffect, useState } from "react";
/** Correctly crop one quadrant of the bundled contact sheet at every aspect ratio. */
export default function Photo({ image, className = "", children }) {
  const ref = useRef(null);
  const [wide, setWide] = useState(false);
  const tile = image?.match(/#tile=(\d)$/)?.[1];
  useEffect(() => {
    if (tile === undefined) return;
    const observer = new ResizeObserver(([entry]) =>
      setWide(entry.contentRect.width / entry.contentRect.height > 1.5),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [tile]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        backgroundImage: `url("${resolveMediaUrl(image)}")`,
        ...(tile !== undefined
          ? {
              backgroundSize: wide ? "200% auto" : "auto 200%",
              backgroundPosition: [
                "left top",
                "right top",
                "left bottom",
                "right bottom",
              ][Number(tile)],
            }
          : {}),
      }}
    >
      {children}
    </div>
  );
}
