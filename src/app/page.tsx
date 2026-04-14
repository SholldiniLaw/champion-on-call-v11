export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Shield, Zap, Users, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-navy-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-navy text-lg tracking-tight">Champion<span className="text-crimson">On-Call</span></span>
          </div>
          <Link href="/login" className="btn-primary text-sm gap-2">Launch Demo <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-600 to-navy-800" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 mb-6 backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />Investor Demo — Champion Insurance Corp.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight" style={{fontFamily:'var(--font-display)'}}>
              Houses don&apos;t make claims, <span className="text-crimson-300">people do.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl">
              Champion On-Call is the managed repair marketplace that connects Florida policyholders with vetted, ranked contractors — instantly. Like an HMO for property insurance, but built for speed, transparency, and trust.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="btn-primary text-base px-8 py-3.5 gap-2">Launch Product Demo <ArrowRight className="w-5 h-5" /></Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-lg border-2 border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10 backdrop-blur-sm">How It Works</a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ label:'Avg Response Time', value:'<45 min', icon:Zap },{ label:'Network Contractors', value:'2,400+', icon:Users },{ label:'Claims Managed', value:'$180M+', icon:BarChart3 },{ label:'Litigation Reduction', value:'72%', icon:Shield }].map((s)=>(
            <div key={s.label} className="card flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-navy-50 flex items-center justify-center shrink-0"><s.icon className="w-5 h-5 text-navy" /></div>
              <div><div className="text-xl sm:text-2xl font-bold text-navy tracking-tight">{s.value}</div><div className="text-xs text-navy-400">{s.label}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight" style={{fontFamily:'var(--font-display)'}}>Three experiences, one platform</h2>
            <p className="mt-4 text-navy-400 max-w-2xl mx-auto">Champion On-Call serves policyholders, contractors, and insurance executives with purpose-built interfaces.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title:'Policyholder', sub:'Report & Choose', desc:'File a claim in minutes. Browse ranked, vetted network contractors. Understand your benefit level before you choose.', steps:['Report your loss','Browse the marketplace','Choose a Champion contractor'], color:'bg-blue-50 text-blue-700 border-blue-200' },
              { title:'Contractor', sub:'Respond & Earn', desc:'Receive real-time blast notifications. Accept claims first-come-first-served. Prove arrival with geo check-in.', steps:['Receive claim blast','Accept the call','Check in on-site'], color:'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { title:'Executive', sub:'Monitor & Optimize', desc:'View response times, contractor rankings, flagged issues, and claims analytics from a real-time dashboard.', steps:['Monitor live claims','Track contractor scores','Optimize the network'], color:'bg-violet-50 text-violet-700 border-violet-200' },
            ].map((p)=>(
              <div key={p.title} className="card p-8 flex flex-col">
                <div className={`inline-flex self-start items-center rounded-full px-3 py-1 text-xs font-semibold border mb-4 ${p.color}`}>{p.sub}</div>
                <h3 className="text-xl font-bold text-navy mb-2">{p.title}</h3>
                <p className="text-navy-400 text-sm leading-relaxed mb-6">{p.desc}</p>
                <div className="mt-auto space-y-3">
                  {p.steps.map((step,i)=>(<div key={step} className="flex items-center gap-3 text-sm"><span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-semibold shrink-0">{i+1}</span><span className="text-navy-600">{step}</span></div>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <h2 className="text-3xl font-bold text-navy tracking-tight mb-6" style={{fontFamily:'var(--font-display)'}}>Florida&apos;s insurance litigation crisis</h2>
            <p className="text-navy-400 leading-relaxed mb-4">Florida accounts for 9% of U.S. homeowners insurance claims but 76% of all homeowners insurance lawsuits. Carriers flee, premiums skyrocket, policyholders suffer.</p>
            <p className="text-navy-400 leading-relaxed">The root cause isn&apos;t weather — it&apos;s the gap between the loss event and the repair. When policyholders find their own contractors, bad actors exploit information asymmetry.</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-navy tracking-tight mb-6" style={{fontFamily:'var(--font-display)'}}>The managed repair solution</h2>
            <div className="space-y-4">
              {['Pre-vetted contractor network eliminates bad-actor risk','Champion Score ranking drives quality competition','First-come-first-served dispatch ensures fastest response','Network benefit incentive (100% vs 80%) aligns interests','Geo-verified on-site check-in prevents phantom inspections','Real-time executive dashboard enables proactive oversight'].map((pt)=>(
                <div key={pt} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-navy-600 text-sm">{pt}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy tracking-tight mb-12" style={{fontFamily:'var(--font-display)'}}>The Team</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[{ name:'David Lockard, Esq.', role:'CEO' },{ name:'David M. Sholl, Esq.', role:'CLO' },{ name:'Paul Udouj, Esq.', role:'VP, Operations' }].map((m)=>(
              <div key={m.name} className="card p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-navy mx-auto mb-4 flex items-center justify-center"><span className="text-xl font-bold text-white">{m.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span></div>
                <h3 className="font-semibold text-navy">{m.name}</h3><p className="text-sm text-navy-400 mt-1">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4" style={{fontFamily:'var(--font-display)'}}>Ready to see it in action?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Explore the full product demo with seeded Florida claims data, live contractor dispatch, and executive analytics.</p>
          <Link href="/login" className="btn-primary text-base px-10 py-4 gap-2">Launch Demo <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>

      <footer className="py-8 border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-navy" /><span className="font-semibold text-navy text-sm">Champion Insurance Corp.</span></div>
          <p className="text-xs text-navy-300">© {new Date().getFullYear()} Champion Insurance Corp. Investor demo only.</p>
        </div>
      </footer>
    </div>
  );
}

