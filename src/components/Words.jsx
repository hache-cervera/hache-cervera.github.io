/**
 * Splits a string into word spans (.pw) so ProximityLight can tint the words
 * the chip is currently passing over.
 */
export default function Words({ children }) {
  return String(children)
    .split(' ')
    .map((word, i) => (
      <span key={i} className="pw inline-block">
        {word}
        {' '}
      </span>
    ));
}
