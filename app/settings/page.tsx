export default function Settings() {
  const sections = ["Account", "Language", "Quran", "Translation", "Audio", "Prayer", "Notifications", "Appearance", "Privacy"];
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 pb-24">
      <h1 className="text-2xl font-semibold text-teal-dark">Settings</h1>
      <div className="mt-6 divide-y divide-border rounded-card border border-border bg-white overflow-hidden">
        {sections.map((s) => (
          <div key={s} className="flex items-center justify-between px-5 py-4 text-sm">
            <span className="text-teal-dark">{s}</span>
            <span className="text-muted">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
