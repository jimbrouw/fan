import Link from "next/link";
import { AppFrame } from "@/components/AppFrame";

type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <AppFrame>
      <article className="flex flex-1 flex-col gap-6 pb-4">
        <div className="border-y border-[var(--line)] py-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Legal</p>
          <h1 className="font-display mt-3 text-[42px] leading-none text-[var(--foreground)]">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{intro}</p>
        </div>

        <div className="space-y-6 text-sm leading-6 text-[var(--foreground-soft)]">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base font-extrabold text-[var(--foreground)]">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-auto border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
          <Link href="/" className="font-semibold text-[var(--foreground)]">
            Back to Kitface
          </Link>
        </div>
      </article>
    </AppFrame>
  );
}
