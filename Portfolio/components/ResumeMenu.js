'use client';

import { useEffect, useRef, useState } from 'react';

const PDF = '/resume/Nithya-Rathinavelu-Resume.pdf';

export default function ResumeMenu({ variant = 'pill', label = 'Resume' }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const button = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className={`resume resume--${variant}`} ref={wrap}>
      <button ref={button} type="button" className="resume__button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        {label} <span aria-hidden="true">↓</span>
      </button>
      {open && (
        <div className="resume__menu" role="menu">
          <a role="menuitem" href={PDF} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <span className="resume__icon" aria-hidden="true">↗</span>
            <span><strong>View resume</strong><small>Opens the PDF in a new tab</small></span>
          </a>
          <a role="menuitem" href={PDF} download="Nithya-Rathinavelu-Resume.pdf" onClick={() => setOpen(false)}>
            <span className="resume__icon" aria-hidden="true">↓</span>
            <span><strong>Download PDF</strong><small>Saves the file to your device</small></span>
          </a>
        </div>
      )}
    </div>
  );
}
