import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "gradient-primary text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-110",
  accent:
    "gradient-accent text-white shadow-md shadow-accent-500/20 hover:shadow-lg hover:shadow-accent-500/30 hover:brightness-110",
  outline:
    "border-2 border-primary-300 text-primary-700 bg-white/60 backdrop-blur hover:bg-primary-50 hover:border-primary-400",
};

export default function GradientButton({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
