interface Props { title: string }

export default function ComingSoon({ title }: Props) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", textAlign: "center", padding: "2rem",
    }}>
      <div style={{
        fontSize: 11, fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.2em",
        color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase",
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem",
        background: "linear-gradient(90deg, var(--text) 60%, var(--text-muted))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        Coming Soon
      </div>
      <div style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 320 }}>
        This feature is under construction. Check back shortly.
      </div>
    </div>
  );
}
