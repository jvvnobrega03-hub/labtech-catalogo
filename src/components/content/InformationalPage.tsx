import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface InformationalSection {
  title: string;
  paragraphs: string[];
}

interface InformationalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  sections: InformationalSection[];
  cta?: {
    label: string;
    href: string;
  };
}

export function InformationalPage({
  eyebrow,
  title,
  description,
  sections,
  cta,
}: InformationalPageProps) {
  return (
    <div className="min-h-screen bg-[#F4FBFD]">
      <section className="bg-[#071018] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24">
          <p className="text-[#27C7FF] text-sm font-bold uppercase tracking-[0.2em] mb-4">
            {eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            {title}
          </h1>
          <p className="max-w-3xl text-lg md:text-xl text-white/70 leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="bg-white rounded-xl border border-[#D8EEF5] p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#102833] mb-4">{section.title}</h2>
              <div className="space-y-3 text-[#102833]/75 leading-relaxed">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
          ))}
        </div>

        {cta && (
          <div className="mt-10 text-center">
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors font-semibold"
            >
              {cta.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
