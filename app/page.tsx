import Wordmark from '@/components/wordmark';
import Slogan from '@/components/slogan';
import Hero from '@/components/hero';
import Story from '@/components/story';
import { DOCS_URL, GITHUB_URL, GitHubMark, GetStarted } from '@/components/links';
export default function Home() {
  return (
    <main id="top">
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#shared-context">Shared context</a>
        <a href="#oversight">Control</a>
        <a href={DOCS_URL}>Docs</a>
        <a className="nav-github" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <GitHubMark /> GitHub
        </a>
      </nav>
      <header className="hero-heading">
        <p className="wordmark">
          <Wordmark />
        </p>
        <h1>
          <Slogan />
        </h1>
        <p className="hero-description">
          Independent minds. Shared context. A clearer way forward.
        </p>
        <GetStarted />
      </header>
      <Hero />
      <Story />
    </main>
  );
}
