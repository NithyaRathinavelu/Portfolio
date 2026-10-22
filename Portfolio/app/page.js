import Link from 'next/link';
import Hero from '@/components/Hero';
import ContactFooter from '@/components/ContactFooter';
import { HandIcon } from '@/components/Icons';
import { projects, highlights, steps, services } from '@/lib/content';

export default function Home() {
  return (
    <>
      <Hero />
      <main id="main">
        <section className="section about" aria-labelledby="about-title">
          <div className="about__row">
            <div className="arch-photo">
              <img src="/images/portrait-home.jpg" alt="Nithya standing in an old wooden doorway" />
            </div>
            <div className="about__text">
              <p className="label">About</p>
              <h2 id="about-title" className="display">Hello, I’m Nithya.</h2>
              <p className="lead">
                I’m a lead UX and product designer in Bengaluru, working on AI and design systems. I’ve spent 7+ years
                designing enterprise SaaS products, where getting the details right decides whether people trust what
                they’re using.
              </p>
              <p>
                Lately that means designing AI that acts on people’s behalf, and the systems that keep it consistent and
                honest. I start by watching how people really work, simplify until the path is obvious, then craft it
                until it feels calm to use.
              </p>
              <dl className="facts">
                <div><dt>7+</dt><dd>years in product design</dd></div>
                <div><dt>Bengaluru</dt><dd>where I’m based</dd></div>
                <div><dt>B2B SaaS</dt><dd>where I work now</dd></div>
              </dl>
              <Link className="text-link" href="/about">More about me</Link>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="how-title">
          <div className="heading">
            <div>
              <p className="label">How I work</p>
              <h2 id="how-title" className="display">
                Observe, simplify, <br />make it <em>obvious</em><span className="clay-dot" aria-hidden="true" />
              </h2>
            </div>
            <p className="heading__intro">
              The same journey as the arches above, from complicated to obvious. It’s how I approach every product, from
              a 7-step legal form to an AI that acts on people’s behalf.
            </p>
          </div>
          <ol className="steps">
            {steps.map((s) => (
              <li className="step" key={s.n}>
                <p className="step__stage">{s.stage}</p>
                <div className="step__title">
                  <HandIcon name={s.icon} />
                  <h3><span>{s.n}</span> {s.title}</h3>
                </div>
                <p>{s.text}</p>
                <p className="step__methods-label">Methods</p>
                <ul className="tags">
                  {s.methods.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="section" id="work" aria-labelledby="work-title">
          <div className="heading">
            <div>
              <p className="label">Selected work</p>
              <h2 id="work-title" className="display">Four projects, from problem to outcome</h2>
            </div>
            <p className="heading__intro">Two AI projects, a design system, and two products live with customers.</p>
          </div>
          <div className="projects">
            {projects.map((p) => (
              <Link className="project" href={`/work/${p.slug}`} key={p.slug}>
                <div className="project__cover" style={{ background: p.tint }}>
                  <div className="browser">
                    <div className="browser__bar" aria-hidden="true"><i /><i /><i /><b /></div>
                    <img src={p.image} alt="" style={{ objectPosition: p.focus }} />
                  </div>
                </div>
                <p className="project__meta">{p.meta}</p>
                <h3 className="project__title">{p.title}</h3>
                <p className="project__summary">{p.summary}</p>
                <span className="text-link">Read the case study</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section highlights-wrap" aria-label="Highlights">
          <dl className="highlights">
            {highlights.map(([n, l]) => (
              <div key={n}><dt>{n}</dt><dd>{l}</dd></div>
            ))}
          </dl>
        </section>

        <section className="section" aria-labelledby="do-title">
          <div className="heading">
            <div>
              <p className="label">What I do</p>
              <h2 id="do-title" className="display">Where I can help</h2>
            </div>
          </div>
          <ul className="services">
            {services.map(([n, t, d]) => (
              <li key={n}><span className="services__n">{n}</span><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ul>
        </section>
      </main>

      <ContactFooter />
    </>
  );
}
