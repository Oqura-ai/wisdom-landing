'use client';

import { useState } from 'react';

/** A shell command with a copy button. */
export function Command({ text }: { text: string }) {
  const [label, setLabel] = useState('copy');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setLabel('copied');
    } catch {
      setLabel('select to copy');
    }
    setTimeout(() => setLabel('copy'), 1600);
  };
  return (
    <span className="cmd">
      <span>
        <span className="p">$</span> {text}
      </span>
      <button className="copy" type="button" onClick={copy}>
        {label}
      </button>
    </span>
  );
}
