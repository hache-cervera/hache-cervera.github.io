// Turns the first mention of the lab site in a plain translation string into a real link.
const SITE = 'devilfruittcg.com';

export function linkSite(text) {
  const i = text.indexOf(SITE);
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <a
        href={`https://${SITE}/`}
        rel="noopener"
        className="text-accent-ink underline decoration-accent-ink/40 underline-offset-2 hover:decoration-accent-ink"
      >
        {SITE}
      </a>
      {text.slice(i + SITE.length)}
    </>
  );
}
