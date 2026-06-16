'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProfileProps {
  profile: {
    name: string;
    tagline: string;
    summary: string;
    profilePicture: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    techStack: string | null;
  };
}

function useTypingEffect(words: string[], typingSpeed = 85, deletingSpeed = 42) {
  const [displayed, setDisplayed] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const currentWord = words[wordIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayed !== currentWord) {
        timer = setTimeout(
          () => setDisplayed(currentWord.slice(0, displayed.length + 1)),
          typingSpeed + Math.random() * 40
        );
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2500);
      }
    } else {
      if (displayed !== '') {
        timer = setTimeout(
          () => setDisplayed(currentWord.slice(0, displayed.length - 1)),
          deletingSpeed
        );
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }, 500);
      }
    }
    return () => clearTimeout(timer);
  }, [displayed, isDeleting, wordIndex, words, typingSpeed, deletingSpeed]);

  return displayed;
}

function Particles() {
  const [particles] = useState<
    { id: number; left: string; top: string; duration: string; delay: string; dx: string; color: string }[]
  >(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${30 + Math.random() * 70}%`,
      duration: `${4 + Math.random() * 5}s`,
      delay: `${Math.random() * 6}s`,
      dx: `${(Math.random() - 0.5) * 60}px`,
      color: Math.random() > 0.5 ? '#10b981' : '#3b82f6',
    }))
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute h-0.5 w-0.5 animate-float rounded-full opacity-0"
          style={{
            left: p.left,
            top: p.top,
            animationDuration: p.duration,
            animationDelay: p.delay,
            ['--dx' as string]: p.dx,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

/** Sparkline SVG — weekly query trend */
function Sparkline() {
  const pts = [12, 22, 16, 30, 24, 28, 18, 32, 25, 35, 22, 30, 27, 33, 20, 36, 28, 34, 30, 32];
  const pts2 = pts.map((v) => Math.max(0, v - 5));
  const W = 200, H = 36;
  const toPath = (arr: number[]) =>
    arr.map((v, i) => `${(i / (arr.length - 1)) * W},${H - v}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={toPath(pts2)} fill="none" stroke="#10b981" strokeWidth="1"
        strokeDasharray="3 2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <polyline points={toPath(pts)} fill="none" stroke="#3b82f6" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Right-column data science decoration — 3 stacked cards */
function DataScienceDecor() {

  return (
    <div className="hidden xl:flex flex-col gap-3 w-[220px] flex-shrink-0">
      {/* Card 1 — bar chart */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:bg-slate-900/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-default">
            <p className="mb-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-600">
                System Status
            </p>
            
            <div className="space-y-2">
                {/* Metrik 1: Coffee */}
                <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-slate-400">Caffeine Level</p>
                <p className="text-[10px] font-mono text-emerald-400">98.2%</p>
                </div>
                
                {/* Metrik 2: Hunger (Jokes) */}
                <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-slate-400">Hunger Accuracy</p>
                <p className="text-[10px] font-mono text-amber-400">100%</p>
                </div>

                {/* Metrik 3: Bug Chance */}
                <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-slate-400">Code Works?</p>
                <p className="text-[10px] font-mono text-blue-400">404: Unsure</p>
                </div>
            </div>
        </div>

      {/* Card 2 — sparkline */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:bg-slate-900/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-default">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-slate-600">
          weekly queries
        </p>
        <Sparkline />
      </div>

      {/* Card 3 — SQL snippet */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:bg-slate-900/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-default">
        <pre className="font-mono text-[10px] leading-relaxed">
          <span className="text-sky-400">SELECT</span>
          <span className="text-slate-400"> insight,{'\n'}    </span>
          <span className="text-emerald-400">COUNT</span>
          <span className="text-slate-600">(*)</span>
          <span className="text-sky-400"> AS </span>
          <span className="text-slate-400">freq{'\n'}</span>
          <span className="text-sky-400">FROM </span>
          <span className="text-amber-400">raw_data{'\n'}</span>
          <span className="text-sky-400">WHERE </span>
          <span className="text-slate-400">value </span>
          <span className="text-slate-600">&gt; </span>
          <span className="text-amber-400">threshold{'\n'}</span>
          <span className="text-sky-400">GROUP BY </span>
          <span className="text-slate-400">insight{'\n'}</span>
          <span className="text-slate-600">-- rows: 142k ✓</span>
        </pre>
      </div>
    </div>
  );
}

function TechStack({ techStack }: { techStack: string }) {
  const techs = techStack.split('|').map((t) => t.trim()).filter(Boolean);
  const rows: string[][] =
    techs.length > 5
      ? [techs.slice(0, Math.floor(techs.length / 2)), techs.slice(Math.floor(techs.length / 2))]
      : [techs];

  return (
    <div className="relative z-10 mx-auto mt-10 w-full max-w-5xl space-y-1.5">
      {rows.map((row, ri) => (
        <div key={ri} className="flex flex-wrap justify-center gap-2">
          {row.map((tech) => (
            <span
              key={tech}
              className="rounded border border-slate-800/50 bg-slate-900/50 px-3 py-1 font-mono text-[10px] text-slate-600 transition-colors duration-200 hover:border-slate-700 hover:text-slate-400"
            >
              [ {tech} ]
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HeroSection({ profile }: ProfileProps) {
  const roles = profile.tagline.split('|').map((t) => t.trim());
  const typedText = useTypingEffect(roles);
  const [mounted, setMounted] = useState(false);
  const [showParticles, setShowParticles] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowParticles(mediaQuery.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const nameParts = profile.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  const initials = nameParts.map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0f1a] px-6 py-20">
      {/* Grid background */}
      <div className="hidden md:flex absolute inset-0 bg-[linear-gradient(rgba(79,79,79,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(79,79,79,0.15)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_50%,transparent_100%)]" />

      {showParticles && <Particles />}

      {/*
        Layout:
        - mobile/tablet : stack vertikal (left → mid)
        - xl+           : 3 kolom [avatar | konten | dekor]
        max-w-5xl supaya di 1920px tidak terlalu renggang
      */}
      <div
        className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 transition-all duration-700 xl:flex-row xl:items-center xl:gap-12 translate-y-0 opacity-100"
      >
        {/* LEFT — avatar + badge */}
        <div className="flex flex-shrink-0 flex-col items-center gap-4">
          <div className="relative">
            <span className="absolute inset-[-8px] animate-ping rounded-full border border-emerald-500/22" />
            <span className="absolute inset-[-8px] animate-ping rounded-full border border-emerald-500/14 [animation-delay:1.1s]" />
            {/* 148px avatar */}
            <div className="h-[148px] w-[148px] animate-coin-flip rounded-full bg-[conic-gradient(#10b981,#3b82f6,#10b981)] p-[2.5px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0f1a]">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full cursor-pointer rounded-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                ) : (
                  <span className="bg-gradient-to-br from-blue-400 to-emerald-400 bg-clip-text text-4xl font-medium text-transparent">
                    {initials}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-1.5 font-mono text-[11px] text-emerald-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Available for opportunities
          </div>
          {profile.techStack && <TechStack techStack={profile.techStack} />}
        </div>

        {/* MID — name, typing, summary, buttons */}
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <h1 className="mb-2 text-left text-4xl font-medium leading-tight tracking-tight text-slate-100 md:text-[2.6rem]">
            {firstName}{' '}
            <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
              {lastName}
            </span>
          </h1>

          <div className="mb-5 flex items-center gap-2 font-mono text-sm text-slate-500">
            <span className="text-slate-600">~/role$</span>
            <span className=" text-sky-400">{typedText}</span>
            <span className="inline-block h-3.5 w-0.5 animate-[blink_0.8s_step-end_infinite] bg-sky-400 align-middle" />
          </div>

          <div className="relative mb-5 w-full overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/50 px-5 py-4 md:backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:bg-slate-900/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-default">
            <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <p className="text-sm leading-relaxed text-slate-400">{profile.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {profile.linkedinUrl && (
              <Link
                href={profile.linkedinUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/[0.07] px-5 py-2.5 text-sm font-medium text-blue-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-blue-500/15"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                Connect on LinkedIn
              </Link>
            )}
            {profile.githubUrl && (
              <Link
                href={profile.githubUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 px-5 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-800/70"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Explore GitHub
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT — data science decor cards (xl only) */}
        <DataScienceDecor />
      </div>
    </section>
  );
}