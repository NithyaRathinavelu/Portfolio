import Link from 'next/link';
import SimpleNav from './SimpleNav';

export default function ComingSoon({ label, title, text }) {
  return (
    <>
      <SimpleNav />
      <main id="main" className="section coming-soon">
        <p className="label">{label}</p>
        <h1 className="display">{title}</h1>
        <p className="heading__intro">{text}</p>
        <Link className="text-link" href="/#work">Back to all work</Link>
      </main>
    </>
  );
}
