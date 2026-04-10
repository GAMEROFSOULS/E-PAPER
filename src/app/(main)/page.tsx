import { ArrowRight, Newspaper, Users, Zap, LayoutTemplate } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 px-4 relative overflow-hidden flex flex-col items-center text-center">
        {/* Abstract background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          Now supporting Multi-Tenant SaaS Deployments
        </div>
        
        <h1 className="newspaper-title text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6 leading-tight">
          Publish the Future of <br className="hidden md:block"/> Digital News
        </h1>
        
        <p className="max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed font-sans">
          A powerful, multi-tenant Headless CMS designed exclusively for e-papers and digital magazines. Bring the classic newspaper feel into the modern digital era.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link href="/login" className="flex items-center justify-center h-12 px-8 text-sm font-medium text-background bg-foreground rounded-lg hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg group">
            Start free trial
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="flex items-center justify-center h-12 px-8 text-sm font-medium border rounded-lg hover:bg-secondary transition-all">
            View Live Demo
          </Link>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="w-full py-20 bg-secondary/30 px-4 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="newspaper-title text-3xl md:text-4xl font-bold mb-4">Crafted for Publishers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to run an independent digital publication or manage hundreds of local client sites via multi-tenancy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Newspaper className="w-8 h-8" />}
              title="Classic Typography"
              description="Beautifully structured components optimized for readability and newspaper-like grids."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Multi-Tenant Auth"
              description="Secure separation of data. Host hundreds of independent newspapers on a single instance."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Blazing Fast Edge"
              description="Built on Next.js 15 App Router. Static generation for instant load times worldwide."
            />
            <FeatureCard 
              icon={<LayoutTemplate className="w-8 h-8" />}
              title="PDF to Digital"
              description="Upload standard print PDFs and automatically parse them into beautiful digital articles."
            />
          </div>
        </div>
      </section>

      {/* Sample Newspaper Layout Preview Section */}
      <section className="w-full py-24 px-4 bg-background max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b-4 border-foreground pb-4">
          <h2 className="newspaper-title text-4xl font-bold">The Morning Post Hub</h2>
          <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground hidden md:inline-block">Sunday Preview Edition</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Hero Article */}
          <div className="lg:col-span-8 flex flex-col gap-4 group cursor-pointer article-card p-4 border rounded-xl bg-card">
            <div className="w-full aspect-[2/1] bg-muted rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent flex items-center justify-center">
                <p className="text-muted-foreground font-serif italic text-lg">Featured Article Hero Image</p>
              </div>
            </div>
            <h3 className="newspaper-title text-3xl font-bold mt-2 group-hover:underline decoration-2 underline-offset-4">Local Publisher Sees 300% Growth with New Digital CMS</h3>
            <p className="text-muted-foreground text-lg leading-relaxed line-clamp-3">
              In a striking turn of events, regional news agencies are reporting massive spikes in readership after switching to modern, lightweight headless content management systems that prioritize both performance and the classic typographical reading experience...
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 text-sm font-medium border-t text-muted-foreground">
              <span>By Editor in Chief</span>
              <span>2 min read</span>
            </div>
          </div>

          {/* Sidebar Articles */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 group cursor-pointer article-card p-4 border rounded-xl bg-card h-full">
                <span className="text-xs font-bold text-destructive uppercase tracking-widest">Breaking News</span>
                <h4 className="newspaper-title text-xl font-bold group-hover:underline decoration-2 underline-offset-4 leading-tight">
                  Supabase Integration Ensures Complete Data Isolation
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-2">Row level security allows developers to build massive multi-tenant platforms safely.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 border rounded-2xl bg-card hover:border-foreground/30 transition-colors flex flex-col h-full article-card">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 newspaper-title">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
    </div>
  );
}
