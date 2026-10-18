import Wordmark from '@/components/wordmark';
import Slogan from '@/components/slogan';
import Hero from '@/components/hero';
import Story from '@/components/story';
export default function Home() {
  return (
    <main id="top">
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#shared-context">Shared context</a>
        <a href="#oversight">Control</a>
        <a href="https://github.com/Oqura-ai" target="_blank" rel="noopener noreferrer">
          GitHub
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
      </header>
      <Hero />
      <Story />
    </main>
  );
}
