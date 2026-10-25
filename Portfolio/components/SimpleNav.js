import Link from 'next/link';
import ResumeMenu from './ResumeMenu';

export default function SimpleNav({ current }) {
  return (
    <header className="simple-nav">
      <Link href="/" className="simple-nav__brand">
        <img src="/images/logo-on-light.png" alt="" width="38" height="38" />
        <span>Nithya Rathinavelu</span>
      </Link>
      <nav aria-label="Main">
        <Link href="/#work">Work</Link>
        <Link href="/about" aria-current={current === 'about' ? 'page' : undefined}>About</Link>
        <Link href="/#contact">Contact</Link>
        <ResumeMenu variant="dark" />
      </nav>
    </header>
  );
}
