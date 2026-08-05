export default function Campo({ label, error, children, required }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
