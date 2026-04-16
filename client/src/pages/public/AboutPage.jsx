import { Link } from 'react-router-dom';
import { Users, Target, Award, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { Button } from '@/components/ui/button';

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We connect skilled professionals with opportunities to evaluate and mentor the next generation of tech talent.', tone: 'emerald' },
  { icon: Users, title: 'Community First', description: 'Our interviewers are more than contractors — they are part of a growing community of industry experts.', tone: 'blue' },
  { icon: Award, title: 'Quality Standards', description: 'Every interview is conducted with rigorous standards ensuring fair, unbiased, and thorough evaluation.', tone: 'amber' },
  { icon: Briefcase, title: 'Flexible Work', description: 'Set your own schedule, choose your domains, and earn competitive pay on your own terms.', tone: 'violet' },
];

const stats = [
  { value: '100+', label: 'Active Interviewers' },
  { value: '5,000+', label: 'Interviews Conducted' },
  { value: '15+', label: 'Tech Domains' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const toneMap = {
  emerald: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-emerald-200/60',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-50 text-blue-600 ring-blue-200/60',
  amber: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-amber-200/60',
  violet: 'bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 ring-violet-200/60',
};

const AboutPage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="About Us" description="Learn about NxtHire — our mission, values, and the team behind the interviewer community platform." path="/about" />

    {/* Hero */}
    <section className="relative overflow-hidden bg-[#f5f7fb] pt-32 pb-24 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-200/50 blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,23,42,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold tracking-wide uppercase text-blue-700 bg-white border border-blue-200 rounded-full shadow-sm">
          <Sparkles size={13} className="text-blue-500" />
          About NxtHire
        </span>
        <h1 className="text-4xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
          Building the Future of{' '}
          <span className="text-blue-600">
            Technical Interviews
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          We connect experienced tech professionals with companies seeking fair, high-quality technical evaluations for their candidates.
        </p>
      </div>
    </section>

    {/* Stats */}
    <section className="max-w-6xl mx-auto px-6 -mt-14 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((s, i) => {
          const grads = [
            'from-emerald-400 to-teal-500',
            'from-blue-500 to-blue-600',
            'from-sky-400 to-blue-500',
            'from-amber-400 to-orange-500',
          ];
          return (
            <div key={s.label} className="relative bg-white rounded-xl border border-slate-200 shadow-xl p-6 text-center overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${grads[i]}`} />
              <p className="text-3xl font-extrabold text-blue-600 tracking-tight">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wide">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>

    {/* Our Story */}
    <section className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-10">
        <span className="inline-flex px-3 py-1 mb-4 text-[11px] font-semibold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
          Our Story
        </span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Where it all{' '}
          <span className="text-blue-600">
            started
          </span>
        </h2>
      </div>
      <div className="space-y-5 text-slate-600 leading-relaxed text-[15px]">
        <p>
          NxtHire was born from a simple observation: companies struggle to find qualified technical interviewers, and experienced professionals want flexible ways to earn and contribute to the tech community.
        </p>
        <p>
          We built a platform that solves both problems. Our network of vetted industry experts conducts structured, domain-specific interviews, ensuring candidates receive fair and thorough evaluations while interviewers enjoy flexible schedules and competitive compensation.
        </p>
        <p>
          Today, our community spans multiple technology domains — from full-stack development to data science, cloud computing, and beyond. Every interview conducted through our platform upholds the highest standards of technical rigor and fairness.
        </p>
      </div>
    </section>

    {/* Values */}
    <section className="relative py-24 bg-[#f5f7fb] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex px-3 py-1 mb-4 text-[11px] font-semibold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
            What We Stand For
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Values that{' '}
            <span className="text-blue-600">
              guide us
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map(v => (
            <div key={v.title} className="bg-white rounded-3xl border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-lg hover:-translate-y-1 transition-all p-7 flex gap-5">
              <div className={`w-14 h-14 rounded-xl ring-1 shadow-sm flex items-center justify-center shrink-0 ${toneMap[v.tone]}`}>
                <v.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900" />
      <div className="absolute inset-0">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl" />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 shadow-xl mb-6">
          <Sparkles className="text-white" size={24} />
        </div>
        <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
          Join our interviewer{' '}
          <span className="text-blue-300">
            community
          </span>
        </h2>
        <p className="mt-5 text-slate-300 text-lg max-w-lg mx-auto">Apply today and start conducting interviews on your own schedule.</p>
        <Button asChild size="lg" className="mt-8 px-8 py-4 h-auto rounded-xl font-semibold text-white border-0 bg-blue-600 hover:bg-blue-700 shadow-xl transition-all">
          <Link to="/applicationform">Apply Now <ArrowRight size={16} className="ml-2" /></Link>
        </Button>
      </div>
    </section>
  </div>
);

export default AboutPage;
