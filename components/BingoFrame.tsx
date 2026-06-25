import { clsx } from "clsx";

type BingoFrameProps = {
  children: React.ReactNode;
  wide?: boolean;
  fullBleed?: boolean;
  className?: string;
};

export function BingoFrame({ children, wide = false, fullBleed = false, className }: BingoFrameProps) {
  if (fullBleed) {
    return (
      <main className={clsx("bingo-shell min-h-[100dvh] text-[var(--foreground)]", className)}>
        {children}
      </main>
    );
  }

  return (
    <main className={clsx("bingo-shell min-h-[100dvh] p-4 text-[var(--foreground)] sm:p-5", className)}>
      <div
        className={clsx(
          "paper-panel mx-auto flex min-h-[calc(100dvh-32px)] w-full flex-col rounded-[28px] px-5 py-5",
          wide ? "max-w-[900px]" : "max-w-[430px]"
        )}
      >
        {children}
      </div>
    </main>
  );
}
