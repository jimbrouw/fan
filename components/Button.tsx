import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[15px] px-5 text-sm font-semibold transition duration-300 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "kitface-btn-primary bg-[var(--accent)] text-white font-bold shadow-[0_12px_28px_rgba(204,0,0,0.30)] hover:bg-[var(--accent-strong)]",
        variant === "secondary" &&
          "border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[rgba(42,0,79,0.2)] hover:bg-white",
        variant === "ghost" && "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
}
