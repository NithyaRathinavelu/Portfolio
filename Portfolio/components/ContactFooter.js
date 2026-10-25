import ResumeMenu from './ResumeMenu';
import { contact } from '@/lib/content';

export default function ContactFooter({ topId = 'top' }) {
  return (
    <footer className="contact" id="contact">
      <p className="label label--light">Contact</p>
      <h2 className="contact__title">Let’s make something <em>calm together.</em></h2>
      <p className="contact__sub">Open to full-time roles in AI, design systems and product design.</p>
      <div className="contact__buttons">
        <a className="btn btn--light" href={`mailto:${contact.email}`}>{contact.email}</a>
        <a className="btn btn--ghost" href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
        <ResumeMenu variant="ghost" />
      </div>
      <div className="contact__foot">
        <span>© 2026 Nithya Rathinavelu</span>
        <span>Bengaluru, India</span>
        <a href={`#${topId}`} className="back-top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
