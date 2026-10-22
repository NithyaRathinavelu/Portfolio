// Hand-drawn style icons for "How I work": a double ink line over a soft sage shape.
const PATHS = {
  observe: ['M 8 31 C 18 18 42 17 52 30', 'M 9 31 C 20 43 41 44 51 30', 'M 30.5 24.2 C 34 24 36.2 27 36 30.3 C 35.8 33.8 33 36.2 29.8 36 C 26.3 35.8 24 33 24.2 29.8 C 24.4 26.6 27 24.1 31.2 24.6'],
  simplify: ['M 5 31 C 9 18 17 43 21 27 C 24 15 13 22 19 34 C 23 44 28 21 31 30', 'M 31 30 C 37 30.4 44 29.6 51 30', 'M 44.5 23.5 C 47 26 49 28 51.5 30.2 C 49 32.5 47 34.5 44.5 36.8'],
  obvious: ['M 30 9 C 42 9.4 51 18 51 30 C 51 42 42 51 30 51 C 18 51 9 42 9.3 30 C 9.5 19 17.5 10.2 31.5 9.6', 'M 19.5 31 C 22 33.4 24.5 35.8 27 38.4 C 31.5 33 36 27.5 41.5 21.5'],
};
const BLOB = { observe: [35, 30, 17, 16], simplify: [40, 31, 16, 15], obvious: [36, 33, 16, 15] };

export function HandIcon({ name }) {
  const [cx, cy, rx, ry] = BLOB[name];
  return (
    <svg className="hand-icon" viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(-12 ${cx} ${cy})`} fill="#C7D9C4" />
      {PATHS[name].map((d) => (
        <g key={d} fill="none" stroke="#1F2A24" strokeLinecap="round" strokeLinejoin="round">
          <path d={d} strokeWidth="2.2" />
          <path d={d} strokeWidth="1.1" opacity="0.35" transform="translate(0.9 0.8)" />
        </g>
      ))}
      {name === 'observe' && <circle cx="30" cy="30" r="2.5" fill="#1F2A24" />}
    </svg>
  );
}
