import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-white text-black shadow-[0_18px_42px_rgba(255,255,255,0.18)] hover:bg-white/90",
        variant === "secondary" &&
          "border border-white/14 bg-white/9 text-white hover:bg-white/14",
        variant === "ghost" && "bg-transparent text-white/72 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
