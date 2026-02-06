interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={`glass-card ${
        hover ? "transition-all duration-300 hover:glass-card-hover" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
