export default function Toggle({ on, onChange, ariaLabel }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={ariaLabel}
      className={`toggle ${on ? 'on' : ''}`}
      onClick={(e) => { e.stopPropagation(); onChange(!on); }}
    />
  );
}