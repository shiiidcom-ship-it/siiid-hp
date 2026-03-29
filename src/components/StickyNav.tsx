"use client";

interface StickyNavProps {
  items: { id: string; label: string }[];
  accent: string;
}

export default function StickyNav({ items, accent }: StickyNavProps) {
  return (
    <nav
      style={{
        position: "sticky",
        top: "64px",
        zIndex: 50,
        background: "rgba(8,8,16,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          whiteSpace: "nowrap",
        }}
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            style={{
              display: "inline-block",
              padding: "16px 20px",
              fontSize: "13px",
              color: "#6b7280",
              textDecoration: "none",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: "500",
              borderBottom: "2px solid transparent",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = accent;
              (e.currentTarget as HTMLElement).style.borderBottomColor = accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#6b7280";
              (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
