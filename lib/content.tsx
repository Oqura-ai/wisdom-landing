import type { ReactNode } from 'react';

export const LINKS = {
  github: 'https://github.com/Oqura-ai/wisdom',
  docs: 'https://oqura-ai.github.io/wisdom-docs',
};

export const INSTALL = 'npm install -g @oqura/wisdom';

/** The hero walkthrough: the film rendered to MP4 (see README, "The film"). */
export const WALKTHROUGH = {
  src: '/film/wisdom-walkthrough.mp4',
  poster: '/film/wisdom-walkthrough-poster.jpg',
};

/** The commit tree beside the features. Commits light up one by one; fork and merge are drawn, not stepped. */
export type TreeRow =
  | { kind: 'commit'; hash: string; msg: string; team?: boolean; ref?: string }
  | { kind: 'fork' }
  | { kind: 'merge'; hash: string };

export const TREE: TreeRow[] = [
  { kind: 'commit', hash: 'a41c0de', msg: 'feat: record the session behind the work' },
  { kind: 'commit', hash: '5be17f2', msg: 'feat: glance, then open' },
  { kind: 'commit', hash: 'c7d0e19', msg: 'feat: the next agent reads the why' },
  { kind: 'commit', hash: '0f3c8a1', msg: 'feat: hand off, clone, share' },
  { kind: 'fork' },
  { kind: 'commit', hash: '9e2b4d7', msg: 'feat(team): commits carry their session', team: true },
  { kind: 'commit', hash: 'd18f6a3', msg: 'feat(team): PRs bring the evidence', team: true },
  { kind: 'commit', hash: 'be4410c', msg: 'feat(team): reviewers ask the record', team: true },
  { kind: 'merge', hash: '3d7e1b0' },
  { kind: 'commit', hash: 'e5a9f02', msg: 'chore: keep it yours' },
  { kind: 'commit', hash: 'HEAD', msg: 'your turn', ref: 'HEAD -> main' },
];

export type Feature = {
  team?: boolean;
  title: string;
  accent: string;
  body?: ReactNode;
  /** A part of the film, in script time: [from, to]. */
  clip?: [number, number];
  extra?: 'checks' | 'install';
};

/** One feature per commit, in the tree's order. */
export const FEATURES: Feature[] = [
  {
    title: 'Work as usual.',
    accent: "It's on the record.",
    body: (
      <>
        Run <code>wisdom connect</code> once. Plain <b>claude</b>, <b>codex</b> and <b>pi</b> keep
        your own login; their hooks hand every prompt, tool call and file change to a daemon on your
        machine.
      </>
    ),
    clip: [7.25, 20.9],
  },
  {
    title: 'Two moves read',
    accent: 'any session.',
    body: (
      <>
        <code>glance</code> gives the outline, one entry per turn. <code>open</code> gives one step,
        whole, exactly as recorded.
      </>
    ),
    clip: [21.3, 25.4],
  },
  {
    title: 'Evidence,',
    accent: 'not a summary.',
    body: 'A new session glances at the record, opens only the step it needs, and answers with positions you can open yourself.',
    clip: [25.5, 29.9],
  },
  {
    title: 'Pass the work on.',
    accent: 'With its history.',
    body: (
      <>
        <code>handoff</code> starts another agent reading the session first. <code>clone</code>{' '}
        tries another way. <code>share</code> sends one file, checked for secrets.
      </>
    ),
    clip: [40.4, 45.7],
  },
  {
    team: true,
    title: 'Each line knows',
    accent: 'the step that wrote it.',
    body: (
      <>
        Commit one <code>wisdom-team.json</code>. From then on each commit is matched, line by line,
        to the recorded step that made it, with a short checked guide.
      </>
    ),
    clip: [46.5, 57.6],
  },
  {
    team: true,
    title: 'Pushed through',
    accent: 'your own git.',
    body: 'Sessions and records travel as hidden refs in your repository, secrets redacted first. CI checks every agent commit has them.',
    clip: [57.7, 66.0],
  },
  {
    team: true,
    title: 'Review with',
    accent: 'the why in hand.',
    body: 'A reviewer fetches the sessions and asks their own agent about any line. It answers with evidence.',
    clip: [67.0, 81.0],
  },
  { title: 'On your machine.', accent: 'In your git.', extra: 'checks' },
  { title: 'Keep the work.', accent: 'Keep the why.', extra: 'install' },
];

export const CHECKS: [strong: string, rest: string][] = [
  ['Recorded locally.', 'Nothing leaves unless you share or push it.'],
  ['Kept as it happened.', 'Never cut or reworded.'],
  ['Secrets checked', 'before anything travels. Logins never do.'],
  ['No Wisdom server.', 'Open source.'],
];

export const FOOTER_LINKS: [heading: string, links: [label: string, href: string][]][] = [
  [
    'Product',
    [
      ['Walkthrough', '#top'],
      ['Team mode', `${LINKS.docs}`],
      ['Changelog', `${LINKS.github}/releases`],
      ['Roadmap', '#'],
    ],
  ],
  [
    'Docs',
    [
      ['Getting started', LINKS.docs],
      ['Usage', LINKS.docs],
      ['Team mode', LINKS.docs],
      ['Limitations', LINKS.docs],
    ],
  ],
  [
    'Community',
    [
      ['GitHub', LINKS.github],
      ['Discussions', `${LINKS.github}/discussions`],
      ['Contributing', LINKS.github],
      ['Security', `${LINKS.github}/security`],
    ],
  ],
  [
    'Oqura',
    [
      ['About', '#'],
      ['Blog', '#'],
      ['Contact', '#'],
      ['Privacy', '#'],
    ],
  ],
];
