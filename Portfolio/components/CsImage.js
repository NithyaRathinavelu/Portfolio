'use client';

import { useEffect, useRef, useState } from 'react';

// Shows the case study image, or a labelled placeholder until the file is added.
export default function CsImage({ src, label, ratio, tag }) {
  const [missing, setMissing] = useState(false);
  const img = useRef(null);
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setMissing(true);
  }, []);
  return (
    <figure className="cs-img" style={{ aspectRatio: String(ratio || 1.6) }}>
      {!missing ? (
        <img ref={img} src={src} alt={label} loading="lazy" onError={() => setMissing(true)} />
      ) : (
        <div className="cs-img__ph"><span>{label}</span><code>{src.split('/').pop()}</code></div>
      )}
      {tag && <span className="cs-img__tag">{tag}</span>}
    </figure>
  );
}
