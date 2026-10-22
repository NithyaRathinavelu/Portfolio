import Link from 'next/link';
import SimpleNav from './SimpleNav';
import ContactFooter from './ContactFooter';
import CsImage from './CsImage';

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Number every image in reading order, so each one has a simple file name.
export function numberImages(sections) {
  let n = 0;
  const walk = (node) => {
    if (Array.isArray(node)) return;
    if (node.i) { n += 1; node._n = n; return; }
    (node.k || []).forEach(walk);
  };
  sections.forEach((s) => s.k.forEach(walk));
  return n;
}

const textOf = (node) => (Array.isArray(node) ? node[1] : (node.k || []).map(textOf).join(' '));
const isCard = (node) => node && !Array.isArray(node) && node.b && node.b !== 'g' && node.b !== 'c';

function Text({ node, ctx }) {
  const [r, x] = node;
  if (x === 'Back to all work') return <Link className="cs-back" href="/#work">Back to all work</Link>;
  if (ctx.isNext && (r === 'h1' || r === 'h2')) return <p className="cs-h1">{ctx.nextTitle}</p>;
  if (/^See the AI assistant case study/.test(x)) return <Link className="text-link" href="/work/conversational-ai">{x}</Link>;
  if (r === 'h1') return ctx.hero ? <h1 className="cs-h1">{x}</h1> : <p className="cs-h1">{x}</p>;
  if (r === 'h2') return <h2 className={ctx.inCard ? 'cs-num' : 'cs-h2'}>{x}</h2>;
  if (r === 'h3') return <h3 className="cs-h3">{x}</h3>;
  if (r === 'h4') return <h4 className="cs-h4">{x}</h4>;
  if (r === 'l') return <p className="label">{x}</p>;
  if (r === 'lead') return <p className="lead">{x}</p>;
  if (r === 's') return <p className="cs-small">{x}</p>;
  if (r === 'i') return <p className="cs-italic">{x}</p>;
  return <p>{x}</p>;
}

function Node({ node, ctx }) {
  if (Array.isArray(node)) return <Text node={node} ctx={ctx} />;
  if (node.i) return <CsImage src={`/images/work/${ctx.slug}/${String(node._n).padStart(2, '0')}.jpg`} label={node.i} ratio={node.a} tag={node.tg} />;
  const kids = node.k || [];

  if (node.n === 'Jump to') {
    return (
      <nav className="cs-jump" aria-label="Jump to a section">
        {kids.map((k, i) => (Array.isArray(k) ? <span className="label" key={i}>{k[1]}</span> : <a key={i} href={`#${slugify(k.to || textOf(k))}`}>{textOf(k)}</a>))}
      </nav>
    );
  }
  if (node.n === 'Project info') {
    return (
      <dl className="cs-info">
        {kids.map((k, i) => <div key={i}><dt>{textOf(k.k[0])}</dt><dd>{textOf(k.k[1])}</dd></div>)}
      </dl>
    );
  }
  if (node.n === 'Table') {
    return (
      <div className="cs-table-wrap">
        <table className="cs-table">
          <tbody>
            {kids.map((row, i) => {
              const head = row.b === 's' && i === 0;
              const Cell = head ? 'th' : 'td';
              return <tr key={i}>{(row.k || []).map((c, j) => <Cell key={j} scope={head ? 'col' : undefined}>{textOf(c)}</Cell>)}</tr>;
            })}
          </tbody>
        </table>
      </div>
    );
  }
  if (node.n === 'Steps') {
    return (
      <ol className="cs-steps">
        {kids.map((k, i) => <li key={i} className={k.b === 'd' ? 'is-last' : ''}><span>{textOf(k.k[0])}</span>{textOf(k.k[1])}</li>)}
      </ol>
    );
  }
  if (node.n === 'Tag') return <span className={`cs-tag cs-tag--${node.b || 'w'}`}>{textOf(node)}</span>;
  if (node.n === 'Button') return <Link className="btn btn--dark" href={`/work/${ctx.next}`}>{textOf(node)} <span aria-hidden="true">→</span></Link>;
  if (node.n === 'Image') return <div className="cs-figure">{kids.map((k, i) => (Array.isArray(k) ? <p className="cs-caption" key={i}>{k[1]}</p> : <Node key={i} node={k} ctx={ctx} />))}</div>;

  const inner = kids.map((k, i) => <Node key={i} node={k} ctx={{ ...ctx, inCard: ctx.inCard || isCard(node) }} />);
  const cls = ['cs-box'];
  if (node.d === 'r') {
    const cards = kids.filter(isCard).length;
    const images = kids.filter((k) => !Array.isArray(k) && (k.i || k.n === 'Image')).length;
    if (node.n === 'Decision') cls.push('cs-decision');
    else if (cards >= 2 || images >= 2 || node.n === 'Images' || (kids.length >= 3 && kids.every((k) => !Array.isArray(k)))) cls.push('cs-grid', `cs-grid--${Math.min(kids.length, node.w ? 2 : 4)}`);
    else if (kids.length === 2) cls.push('cs-split');
    else cls.push('cs-row');
  } else cls.push('cs-col');
  if (isCard(node)) cls.push('cs-card', `cs-card--${node.b}`);
  if (node.n === 'Callout') cls.push('cs-callout');
  if (node.n === 'In short') cls.push('cs-inshort');
  return <div className={cls.join(' ')}>{inner}</div>;
}

export default function CaseStudy({ data, slug, next, nextTitle }) {
  return (
    <>
      <div id="top" />
      <SimpleNav />
      <main id="main" className="cs">
        {data.map((s) => {
          const ctx = { slug, next, nextTitle, hero: s.s === 'Hero', isNext: s.s === 'Next project' };
          const kind = s.s === 'Hero' ? 'cs-hero' : s.s === 'Next project' ? 'cs-next' : s.s === 'Cover' ? 'cs-cover' : '';
          return (
            <section id={slugify(s.s)} key={s.s} className={`cs-section ${kind}`}>
              <div className="cs-inner">
                {s.k.map((k, i) => <Node key={i} node={k} ctx={ctx} />)}
              </div>
            </section>
          );
        })}
      </main>
      <ContactFooter />
    </>
  );
}
