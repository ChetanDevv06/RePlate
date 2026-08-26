'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronRight, FileText, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: Section[];
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  version,
  lastUpdated,
  effectiveDate,
  sections,
  children,
}: LegalPageLayoutProps) {
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pb-16">
      {/* Top Header Banner */}
      <div className="bg-card border-b border-border/70 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-xs">
              <Link href="/">
                <ArrowLeft className="size-3.5 mr-1" />
                Back to RePlate
              </Link>
            </Button>
            <span>/</span>
            <span>Legal & Compliance</span>
            <span>/</span>
            <span className="text-foreground font-medium">{title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {title}
                </h1>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  v{version}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl border">
              <div>
                <span className="block font-medium text-foreground">Effective: {effectiveDate}</span>
                <span className="block text-[11px]">Last updated: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar TOC + Document Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        {/* Mobile Table of Contents Collapsible */}
        <div className="lg:hidden mb-6">
          <Card className="border-border/70">
            <button
              type="button"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="w-full p-4 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Table of Contents ({sections.length} sections)
              </span>
              <ChevronDown
                className={cn('size-4 text-muted-foreground transition-transform', mobileTocOpen && 'rotate-180')}
              />
            </button>
            {mobileTocOpen && (
              <CardContent className="pt-0 pb-4 border-t space-y-1">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left py-1.5 px-2 text-xs rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center gap-2"
                  >
                    <span className="text-[10px] font-mono text-primary">{index + 1}.</span>
                    <span>{section.title}</span>
                  </button>
                ))}
              </CardContent>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sticky Sidebar TOC (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-6 space-y-4">
            <Card className="border-border/70 shadow-sm bg-card">
              <div className="p-4 border-b">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="size-3.5 text-primary" />
                  Table of Contents
                </h2>
              </div>
              <div className="p-3 max-h-[calc(100vh-220px)] overflow-y-auto space-y-1 text-xs">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground flex items-start gap-2 group"
                  >
                    <span className="font-mono text-primary/70 text-[11px] shrink-0 mt-0.5">{index + 1}.</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{section.title}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="border-border/70 bg-emerald-50/40 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck className="size-4" />
                Compliance Framework
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                This document forms part of RePlate’s statutory consumer and food safety compliance architecture for the Indian market.
              </p>
            </Card>
          </div>

          {/* Document Content (8 cols) */}
          <div className="lg:col-span-8 bg-card border border-border/70 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
