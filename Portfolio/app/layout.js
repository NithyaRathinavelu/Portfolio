import './globals.css';

// Reads the site address from Vercel, and falls back safely if it's missing or mistyped.
function siteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/^["']|["']$/g, '');
  const withProtocol = raw && !/^https?:\/\//.test(raw) ? `https://${raw}` : raw;
  const fallback = new URL('https://nithya-rathinavelu-portfolio.vercel.app');
  try {
    const url = new URL(withProtocol);
    // A real address has a dot in it (like example.com); anything else is a typo.
    return url.hostname.includes('.') ? url : fallback;
  } catch {
    return fallback;
  }
}

export const metadata = {
  title: 'Nithya Rathinavelu: Lead UX and product designer',
  description:
    'Lead UX and product designer in Bengaluru, working on AI experiences, design systems and complex B2B products.',
  icons: { icon: '/images/logo-on-light.png' },
  metadataBase: siteUrl(),
  openGraph: {
    title: 'Nithya Rathinavelu: Lead UX and product designer',
    description: 'Shaping the complicated until it feels obvious.',
    type: 'website',
    images: [{ url: '/images/og-image-v2.png', width: 2400, height: 1260, alt: 'Nithya Rathinavelu, Lead UX and product designer' }],
  },
  twitter: { card: 'summary_large_image', images: ['/images/og-image-v2.png'] },
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
