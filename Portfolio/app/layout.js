import './globals.css';

export const metadata = {
  title: 'Nithya Rathinavelu: Lead UX and product designer',
  description:
    'Lead UX and product designer in Bengaluru, working on AI experiences, design systems and complex B2B products.',
  icons: { icon: '/images/logo-on-light.png' },
  openGraph: {
    title: 'Nithya Rathinavelu: Lead UX and product designer',
    description: 'Shaping the complicated until it feels obvious.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat&family=Figtree:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
