interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
  style,
}: GlassCardProps) {
  return (
    <div
      className={`glass-card ${
        hover ? "transition-all duration-300 hover:glass-card-hover" : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
