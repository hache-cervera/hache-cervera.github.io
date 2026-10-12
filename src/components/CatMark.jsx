/* Hache's signature: the pixel cat with terminal eyes (a ">" prompt and a cursor). */
export default function CatMark({ className = '', title }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true, focusable: 'false' };
  return (
    <svg viewBox="0 0 18 17" shapeRendering="crispEdges" className={className} {...a11y}>
      <path fill="currentColor" d="M1 0h1v1h-1zM16 0h1v1h-1zM1 1h2v1h-2zM15 1h2v1h-2zM1 2h3v1h-3zM14 2h3v1h-3zM1 3h4v1h-4zM13 3h4v1h-4zM1 4h16v1h-16zM0 5h18v1h-18zM0 6h3v1h-3zM4 6h14v1h-14zM0 7h4v1h-4zM5 7h13v1h-13zM0 8h5v1h-5zM6 8h12v1h-12zM0 9h4v1h-4zM5 9h13v1h-13zM0 10h3v1h-3zM4 10h7v1h-7zM15 10h3v1h-3zM0 11h8v1h-8zM10 11h8v1h-8zM0 12h7v1h-7zM8 12h2v1h-2zM11 12h7v1h-7zM0 13h8v1h-8zM10 13h8v1h-8zM1 14h16v1h-16zM2 15h14v1h-14zM3 16h12v1h-12z" />
      <path fill="#ff3c00" d="M11 10h4v1h-4z" />
    </svg>
  );
}
