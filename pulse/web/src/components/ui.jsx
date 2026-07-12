export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`bg-surface border border-border rounded-card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-[1.375rem] font-semibold leading-tight">{title}</h3>
          {action}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  ghost: 'bg-transparent hover:bg-surface-2 text-text border border-border',
  danger: 'bg-transparent hover:bg-danger/10 text-danger border border-danger/40',
};

export function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`h-9 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

const scoreColor = (s) => (s >= 80 ? 'text-ok' : s >= 50 ? 'text-warn' : 'text-danger');

export function Score({ value, label }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <span className={`text-5xl font-bold tabular-nums ${scoreColor(value)}`}>{value ?? '—'}</span>
      <span className="text-xs text-muted mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );
}

const sevStyle = {
  critical: 'bg-danger/15 text-danger',
  warning: 'bg-warn/15 text-warn',
  notice: 'bg-muted/15 text-muted',
  info: 'bg-primary/15 text-primary',
};

export function Badge({ severity = 'notice', children }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${sevStyle[severity] || sevStyle.notice}`}>{children}</span>;
}

export function Empty({ children }) {
  return <p className="text-muted text-sm py-8 text-center">{children}</p>;
}
