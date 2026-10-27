export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-block" role="status">
      <div className="spinner-ring" />
      {label ? <div className="spinner-label">{label}</div> : null}
    </div>
  );
}
