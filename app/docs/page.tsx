import { Navbar } from "@/components/Navbar";
import { DatasetExplorer } from "@/components/landing/DatasetExplorer";
import { Languages, Globe2 } from "lucide-react";

const CORE_LANGUAGES = [
  { code: "hi", label: "Hindi", region: "India" },
  { code: "ta", label: "Tamil", region: "India / Sri Lanka" },
  { code: "te", label: "Telugu", region: "India" },
  { code: "kn", label: "Kannada", region: "India" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pt-24 pb-16 space-y-12">
        <header className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ALM-Asia Dataset Showcase
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Inspect how ALM-Asia blends multilingual speech, non-speech events
              and rich metadata into training-ready JSON objects.
            </p>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-background via-background/80 to-background/60 px-4 py-6 sm:px-6 sm:py-8">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight">
                Top supported Asian languages
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Optimized for Indian and broader Asian speech: robust accents,
                code-mixing, and noisy real-world environments.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:gap-4">
              {CORE_LANGUAGES.map((lang, index) => (
                <div
                  key={lang.code}
                  className="group relative overflow-hidden rounded-xl border border-accent/40 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-900/40 px-3 py-3 text-xs shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/30 animate-in fade-in-50 zoom-in-95"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-violet-500/20" />
                  <div className="relative flex flex-col items-start gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-emerald-400 text-white shadow-md shadow-blue-500/40">
                      <Languages className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-blue-200/90">
                        {lang.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-50">
                        {lang.label}
                      </span>
                      <span className="text-[11px] text-slate-300/85">
                        {lang.region}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="group relative overflow-hidden rounded-xl border border-dashed border-accent/40 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-900/40 px-3 py-3 text-xs shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/30 animate-in fade-in-50 zoom-in-95">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-blue-500/20" />
                <div className="relative flex flex-col items-start gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-white shadow-md shadow-emerald-500/40">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/90">
                      + more
                    </span>
                    <span className="text-sm font-semibold text-slate-50">
                      Other Asian languages
                    </span>
                    <span className="text-[11px] text-slate-300/85">
                      Bangla, Urdu, Malayalam, English and more.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DatasetExplorer />
      </main>
    </div>
  );
}
