'use client';

import { useEffect, useRef, useState } from 'react';
import ResumeMenu from './ResumeMenu';
import { createFluid } from '@/lib/fluid';

const ARCHES = [
  { src: '/images/hero-arch-1.jpg', alt: 'A dense maze of walls and stairs' },
  { src: '/images/hero-arch-2.jpg', alt: 'A path being carved through the maze' },
  { src: '/images/hero-arch-3.jpg', alt: 'One clear path through an open arch' },
];

const DREAMS = [
  { src: '/images/dream-1.jpg', tint: '#D9A46A' },
  { src: '/images/dream-2.jpg', tint: '#C9655A' },
  { src: '/images/dream-3.jpg', tint: '#5E9A86' },
];

const DYE = [
  [0.12, 0.42, 0.22],
  [0.56, 0.24, 0.12],
  [0.18, 0.5, 0.3],
];

export default function Hero() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const archRefs = useRef([]);
  const cursorRef = useRef(null);
  const hold = useRef({ x: 0.5, y: 0.5, r: 0, target: 0 });
  const [fluidOn, setFluidOn] = useState(false);
  const [hinted, setHinted] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = window.matchMedia('(max-width: 700px)').matches;

    let fluid = null;
    let frame = 0;
    let last = performance.now();
    const pointer = { x: 0, y: 0, px: 0, py: 0, moved: false, colour: 0 };
    const images = ARCHES.map((a) => {
      const img = new Image();
      img.src = a.src;
      return img;
    });

    const dreams = DREAMS.map((d) => { const img = new Image(); img.src = d.src; return img; });
    const dreamScene = document.createElement('canvas');

    // Draw the three arches (with their dark overlay) into a picture the fluid can move.
    const scene = document.createElement('canvas');
    function archPath(ctx, x, y, w, h) {
      const rad = w / 2;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + rad);
      ctx.arc(x + rad, y + rad, rad, Math.PI, 0);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
    }
    function cover(ctx, img, x, y, w, h) {
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    }
    function paint(target, list, fallback, overlay) {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      target.width = Math.round(rect.width * dpr);
      target.height = Math.round(rect.height * dpr);
      const ctx = target.getContext('2d');
      ctx.clearRect(0, 0, target.width, target.height);
      archRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (r.left - rect.left) * dpr, y = (r.top - rect.top) * dpr, w = r.width * dpr, h = r.height * dpr;
        ctx.save();
        archPath(ctx, x, y, w, h);
        ctx.clip();
        const img = list[i];
        if (img.complete && img.naturalWidth) cover(ctx, img, x, y, w, h);
        else { ctx.fillStyle = fallback[i]; ctx.fillRect(x, y, w, h); }
        ctx.fillStyle = overlay;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
      });
    }
    function drawScene() {
      if (!fluid) return;
      paint(scene, images, ['#C8C3B4', '#C8C3B4', '#C8C3B4'], 'rgba(19, 26, 22, 0.38)');
      fluid.setScene(scene);
      paint(dreamScene, dreams, DREAMS.map((d) => d.tint), 'rgba(10, 14, 16, 0.22)');
      fluid.setReveal(dreamScene);
    }

    function size() {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      if (fluid) { fluid.resize(); drawScene(); }
    }

    function toUv(e) {
      const rect = hero.getBoundingClientRect();
      return [(e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height];
    }

    function onMove(e) {
      const [x, y] = toUv(e);
      if (!pointer.moved) { pointer.px = x; pointer.py = y; }
      pointer.x = x; pointer.y = y; pointer.moved = true;
      if (hold.current.target > 0) { hold.current.x = x; hold.current.y = y; }
      const c = cursorRef.current; if (c && e.pointerType === 'mouse') { const r = hero.getBoundingClientRect(); c.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`; c.classList.add('is-on'); c.classList.toggle('is-link', !!e.target.closest('a, button')); }
    }
    function onDown(e) {
      if (e.target.closest('a, button')) return;
      const [x, y] = toUv(e);
      hold.current.x = x; hold.current.y = y; hold.current.target = 1;
      setHinted(true);
    }
    function onUp() { hold.current.target = 0; }

    // Press and hold: a circle grows from the pointer and turns the scene to night.
    function updateHold(dt) {
      const h = hold.current;
      const max = 2.2;
      const goal = h.target ? max : 0;
      const speed = h.target ? 0.75 : 2.2;
      if (reduce) h.r = goal;
      else h.r += Math.sign(goal - h.r) * Math.min(Math.abs(goal - h.r), speed * dt);
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--hold-x', `${h.x * 100}%`);
      hero.style.setProperty('--hold-y', `${(1 - h.y) * 100}%`);
      hero.style.setProperty('--hold-r', `${h.r * Math.max(rect.width, rect.height)}px`);
      hero.style.setProperty('--hold-amt', String(Math.min(1, Math.max(0, (h.r - 0.35) / 0.5))));
    }

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      updateHold(dt);
      if (fluid) {
        if (pointer.moved) {
          const dx = (pointer.x - pointer.px) * 5200, dy = (pointer.y - pointer.py) * 5200;
          if (Math.abs(dx) + Math.abs(dy) > 0.5) {
            pointer.colour = (pointer.colour + 1) % (DYE.length * 20);
            fluid.splat(pointer.x, pointer.y, dx, dy, DYE[Math.floor(pointer.colour / 20)]);
          }
          pointer.px = pointer.x; pointer.py = pointer.y;
        }
        fluid.step(dt);
        const box = hero.getBoundingClientRect();
        const scale = Math.max(box.width, box.height) / Math.max(1, box.height);
        fluid.render({ x: hold.current.x, y: hold.current.y, r: hold.current.r * scale });
      }
      frame = requestAnimationFrame(loop);
    }

    if (!reduce) {
      try { fluid = createFluid(canvas, { lowPower }); } catch (e) { fluid = null; }
    }
    size();
    if (fluid) {
      setFluidOn(true);
      images.forEach((img) => img.addEventListener('load', drawScene));
      dreams.forEach((img) => img.addEventListener('load', drawScene));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawScene);
      drawScene();
    }

    const ro = new ResizeObserver(size);
    ro.observe(hero);
    const onLeave = () => cursorRef.current && cursorRef.current.classList.remove('is-on');
    hero.addEventListener('pointerleave', onLeave);
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      hero.removeEventListener('pointerleave', onLeave);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (fluid) fluid.destroy();
    };
  }, []);

  return (
    <header ref={heroRef} id="top" className={`hero${fluidOn ? " is-fluid" : ""}`}>
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__night" aria-hidden="true" />
      <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
      <div ref={cursorRef} className="hero__cursor" aria-hidden="true"><span /></div>

      <div className="hero__top">
        <a className="hero__logo" href="/" aria-label="Nithya Rathinavelu, home">
          <img src="/images/logo-on-dark.png" alt="" width="38" height="38" />
        </a>
        <nav className="hero__nav" aria-label="Main">
          <a href="#work">Work</a>
          <a href="/about">About</a>
          <a href="#contact">Contact</a>
          <ResumeMenu />
        </nav>
      </div>

      <div className="hero__main">
        <p className="hero__eyebrow">Lead UX and product designer · Bengaluru</p>
        <div className="hero__stage">
          <div className="hero__arches">
            {ARCHES.map((a, i) => (
              <div className="hero__arch" key={a.src} ref={(el) => (archRefs.current[i] = el)}>
                <img src={a.src} alt={a.alt} />
              </div>
            ))}
          </div>
          <h1 className="hero__title">
            <span className="hero__line">Shaping the complicated</span>
            <span className="hero__line">
              until it feels <em>obvious</em>
              <span className="hero__dot" aria-hidden="true" />
            </span>
          </h1>
        </div>
        <p className="hero__dream" aria-hidden="true">Places on my list: Amalfi Coast · Tulip fields · Northern lights</p>
        <p className={`hero__hint${hinted ? ' is-hidden' : ''}`} aria-hidden="true">
          <span className="hero__hint-dot" />
          <span className="hero__hint-mouse">Press and hold</span>
          <span className="hero__hint-touch">Touch and hold</span>
        </p>
      </div>

      <div className="hero__bottom">
        <img src="/images/logo-on-dark.png" alt="" width="30" height="30" className="hero__logo-small" />
        <ul className="hero__services">
          <li>Product design</li>
          <li>Design systems</li>
          <li>AI UX</li>
        </ul>
        <span className="hero__place">Bengaluru</span>
      </div>
    </header>
  );
}
