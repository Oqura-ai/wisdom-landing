import { Board } from '@/components/board';
import { Command } from '@/components/copy-button';
import { Features } from '@/components/features';
import { Footer } from '@/components/footer';
import { HeroFilm } from '@/components/hero-film';
import { ToTop } from '@/components/to-top';
import { INSTALL, LINKS } from '@/lib/content';

export default function Home() {
  return (
    <>
      <Board />
      <header className="nav">
        <div className="wrap">
          <a className="logo" href="#top">
            <i aria-hidden="true">
              <b />
              <b />
              <b />
              <b />
              <b />
              <b />
            </i>
            wisdom
          </a>
          <nav aria-label="Main">
            <a href={LINKS.docs} target="_blank" rel="noopener noreferrer">
              docs
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
              github
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-in wrap">
            <div className="intro">
              <h1>
                Collaboration in the <em>agentic</em> era.
              </h1>
              <p className="lede">
                Wisdom records every agent session and ties each commit to the session that made it.
              </p>
              <div className="cta">
                <Command text={INSTALL} />
              </div>
            </div>
            <HeroFilm />
          </div>
        </section>
        <Features />
      </main>

      <Footer />
      <ToTop />
    </>
  );
}
