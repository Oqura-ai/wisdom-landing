import { FOOTER_LINKS, LINKS } from '@/lib/content';
import { FooterBot } from './footer-bot';

const external = (href: string) => href.startsWith('http');

const SOCIAL: [label: string, href: string, path: string][] = [
  [
    'GitHub',
    LINKS.github,
    'M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z',
  ],
  [
    'X',
    '#',
    'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12Z',
  ],
  [
    'LinkedIn',
    '#',
    'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.86V21H9z',
  ],
  [
    'YouTube',
    '#',
    'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6Z',
  ],
];

/** Links, then the wordmark with the bot as its "o", fading out at the bottom, then social icons. */
export function Footer() {
  return (
    <footer>
      <div className="wrap fcols">
        {FOOTER_LINKS.map(([heading, links]) => (
          <div key={heading}>
            <h4>{heading}</h4>
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                {...(external(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="mark" role="img" aria-label="wisdom">
        <span aria-hidden="true">wisd</span>
        <FooterBot />
        <span aria-hidden="true">m</span>
      </div>
      <div className="social">
        {SOCIAL.map(([label, href, d]) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            {...(external(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={d} />
            </svg>
          </a>
        ))}
      </div>
      <p className="fcopy">© 2026 Oqura</p>
    </footer>
  );
}
