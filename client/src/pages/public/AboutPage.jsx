import { Link } from 'react-router-dom';
import { Users, Target, Award, Briefcase, ArrowRight } from 'lucide-react';
import SEO from '../../components/common/SEO';

const ACCENT = '#C0392B';
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const Eyebrow = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
    {children}
  </span>
);

const values = [
  { icon: Target, title: 'Mission-driven', description: 'We connect skilled professionals with opportunities to evaluate and mentor the next generation of tech talent.' },
  { icon: Users, title: 'Community first', description: 'Our interviewers are more than contractors — they are part of a growing community of industry experts.' },
  { icon: Award, title: 'Quality standards', description: 'Every interview is conducted with rigorous standards ensuring fair, unbiased, and thorough evaluation.' },
  { icon: Briefcase, title: 'Flexible work', description: 'Set your own schedule, choose your domains, and earn competitive pay on your own terms.' },
];

const stats = [
  { value: '100+', label: 'Active Interviewers' },
  { value: '5,000+', label: 'Interviews Conducted' },
  { value: '15+', label: 'Tech Domains' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const AboutPage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="About Us" description="Learn about NxtHire — our mission, values, and the team behind the interviewer community platform." path="/about" />

    <section className="border-b border-border bg-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 pt-20 pb-16 lg:pt-24 lg:pb-20">
        <Eyebrow>About NxtHire</Eyebrow>
        <h1 style={DISPLAY} className="mt-6 text-[44px] sm:text-[56px] lg:text-[60px] font-semibold text-foreground leading-[1.05] tracking-tight">
          Building the future of <em className="italic" style={{ color: ACCENT }}>technical interviews</em>.
        </h1>
        <p className="mt-6 text-[15px] sm:text-[16px] text-foreground/80 max-w-2xl leading-relaxed">
          We connect experienced tech professionals with companies seeking fair, high-quality technical evaluations for their candidates.
        </p>
      </div>
    </section>

    <section className="border-b border-border bg-[#FBFAF7]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-border">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-7 text-left">
              <p style={DISPLAY} className="text-[32px] sm:text-[40px] font-semibold text-foreground tracking-tight leading-none">{s.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground mt-3 uppercase tracking-[0.2em]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="border-b border-border bg-white">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-20 lg:py-24">
        <Eyebrow>Our Story</Eyebrow>
        <h2 style={DISPLAY} className="mt-5 text-[34px] sm:text-[42px] font-semibold text-foreground tracking-tight leading-tight">
          Where it all started.
        </h2>
        <div className="mt-8 space-y-5 text-foreground/80 leading-relaxed text-[15.5px]">
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
      </div>
    </section>

    <section className="border-b border-border bg-[#FBFAF7]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20 lg:py-24">
        <div className="max-w-2xl">
          <Eyebrow>What we stand for</Eyebrow>
          <h2 style={DISPLAY} className="mt-5 text-[34px] sm:text-[42px] font-semibold text-foreground tracking-tight leading-tight">
            Values that guide us.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {values.map(v => (
            <div key={v.title} className="bg-white rounded-2xl border border-border p-7 flex gap-5">
              <div className="h-10 w-10 rounded-full border border-border bg-white flex items-center justify-center shrink-0 text-foreground/90">
                <v.icon size={16} />
              </div>
              <div>
                <h3 style={DISPLAY} className="text-[20px] font-semibold text-foreground tracking-tight">{v.title}</h3>
                <p className="mt-1.5 text-[13.5px] text-foreground/80 leading-relaxed">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-primary">
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-20 lg:py-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          Join us
        </span>
        <h2 style={DISPLAY} className="mt-6 text-[34px] sm:text-[48px] font-semibold text-white tracking-tight leading-[1.08]">
          Join our interviewer <em className="italic" style={{ color: ACCENT }}>community</em>.
        </h2>
        <p className="mt-5 text-muted-foreground/40 text-[15px] max-w-lg mx-auto leading-relaxed">
          Apply today and start conducting interviews on your own schedule.
        </p>
        <Link
          to="/applicationform"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-foreground transition-colors hover:bg-primary/90 hover:text-white"
        >
          Apply now <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  </div>
);

export default AboutPage;
