import SimpleNav from '@/components/SimpleNav';
import ContactFooter from '@/components/ContactFooter';
import { about } from '@/lib/content';

export const metadata = {
  title: 'About: Nithya Rathinavelu',
  description: 'Lead UX and product designer in Bengaluru with 7+ years designing enterprise SaaS, design systems and AI products.',
};

export default function About() {
  return (
    <>
      <div id="top" />
      <SimpleNav current="about" />
      <main id="main">
        <section className="about-intro" aria-labelledby="hello">
          <div className="about-intro__inner">
            <div className="about-intro__text">
              <p className="label">About</p>
              <h1 id="hello" className="display display--xl">Hello, I’m Nithya.</h1>
              <p className="lead">
                I’m a lead UX and product designer in Bengaluru with 7+ years of designing enterprise SaaS, design systems
                and AI products for a platform with 50,000+ active users.
              </p>
              <p>
                I care about the moment complex things become simple: when a 7-step legal process feels obvious, or an AI
                can be trusted to act on someone’s behalf.
              </p>
            </div>
            <div className="arch-photo arch-photo--about">
              <img src="/images/portrait-about.jpg" alt="Nithya painting at a workshop table" />
            </div>
          </div>
          <dl className="fact-cards">
            {about.facts.map(([n, l]) => (
              <div key={n}><dt>{n}</dt><dd>{l}</dd></div>
            ))}
          </dl>
        </section>

        <section className="section" aria-labelledby="story-title">
          <div className="heading heading--single">
            <div>
              <p className="label">My story</p>
              <h2 id="story-title" className="display">Technology and people, from the start</h2>
            </div>
          </div>
          <div className="story">
            {about.story.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
          </div>
        </section>

        <section className="section" aria-labelledby="exp-title">
          <div className="heading">
            <div>
              <p className="label">Experience</p>
              <h2 id="exp-title" className="display">How I got here</h2>
            </div>
            <p className="heading__intro">Seven years growing with one enterprise SaaS company, after a year of freelancing.</p>
          </div>
          <ol className="timeline">
            {about.roles.map((r) => (
              <li key={r.title}>
                <div className="timeline__when">
                  <p>{r.when}</p>
                  {r.current && <span className="badge">Current</span>}
                </div>
                <div>
                  <h3>{r.title}</h3>
                  <p className="timeline__where">{r.where}</p>
                  <ul className="timeline__points">
                    {r.points.map((pt) => <li key={pt.slice(0, 24)}>{pt}</li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section" aria-labelledby="skills-title">
          <div className="heading heading--single">
            <div>
              <p className="label">Skills</p>
              <h2 id="skills-title" className="display">What I bring to a team</h2>
            </div>
          </div>
          <ul className="skills">
            {about.skills.map(([t, d]) => (
              <li key={t}><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ul>
          <h3 className="label label--muted tools-title">Tools I use</h3>
          <ul className="tools">
            {about.tools.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <p className="tools-note">
            I also use AI tools to go from Figma to working prototypes and small deployed apps myself, which speeds up
            testing ideas with people.
          </p>
        </section>

        <section className="section" aria-labelledby="rec-title">
          <div className="heading heading--single">
            <div>
              <p className="label">Recognition and learning</p>
              <h2 id="rec-title" className="display">Awards, certificates and education</h2>
            </div>
          </div>
          <div className="recognition">
            {about.recognition.map(([group, items]) => (
              <div key={group}>
                <h3 className="label label--muted">{group}</h3>
                {items.map(([t, d]) => (
                  <div className="recognition__item" key={t}><p className="recognition__title">{t}</p><p>{d}</p></div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="section beyond" aria-labelledby="beyond-title">
          <div className="heading">
            <div>
              <p className="label">Beyond work</p>
              <h2 id="beyond-title" className="display">What keeps me curious</h2>
            </div>
            <p className="heading__intro">The things I notice outside work find their way into how I design.</p>
          </div>
          <ul className="polaroids">
            {about.polaroids.map((p) => (
              <li className="polaroid" key={p.title} style={{ '--tilt': `${p.tilt}deg`, '--drop': `${p.drop}px`, '--photo-tilt': `${p.photoTilt || 0}deg` }}>
                <span className="polaroid__tape" aria-hidden="true" />
                <img src={p.image} alt={p.title} />
                <p className="polaroid__title">{p.title}</p>
                <p className="polaroid__note">{p.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <ContactFooter />
    </>
  );
}
