import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../../components/common/SEO';
import {
  ArrowRight,
  Users,
  Briefcase,
  TrendingUp,
  Star,
  Award,
  IndianRupee,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  ChevronRight,
  Shield,
  Sparkles,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

// --- Hero ---
const Hero = ({ onApply }) => (
  <section className="relative bg-[#f5f7fb] overflow-hidden">
    {/* premium background — radial glows + grid */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-blue-200/40 blur-3xl -translate-y-1/3 translate-x-1/4" />
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

    <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 lg:pt-44 lg:pb-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left -- copy */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold tracking-wide uppercase text-blue-700 bg-white border border-blue-200 rounded-full shadow-sm">
            <Sparkles size={13} className="text-blue-500" />
            Future of Interviewer Hiring
          </span>

          <h1 className="text-5xl lg:text-[3.75rem] xl:text-6xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
            Elevate Your{' '}
            <span className="text-blue-600">
              Interview Career
            </span>{' '}
            With Smart Hiring.
          </h1>

          <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl">
            Turn your industry expertise into meaningful income. Join NxtWave's premium interviewer community and help shape the next generation of tech talent — on your own schedule.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Button
              onClick={onApply}
              size="lg"
              className="px-7 py-3.5 h-auto rounded-xl font-semibold text-white border-0 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:shadow-xl transition-all"
            >
              Apply Now <ArrowRight size={18} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-7 py-3.5 h-auto rounded-xl font-semibold border-slate-200 bg-white/70 backdrop-blur hover:bg-white text-slate-700"
              asChild
            >
              <a href="#how-it-works">
                How It Works <ChevronRight size={18} />
              </a>
            </Button>
          </div>

          {/* trust strip */}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Shield size={14} className="text-blue-600" />
              </div>
              <span className="font-medium">Verified Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Users size={14} className="text-blue-600" />
              </div>
              <span className="font-medium">100+ Active Interviewers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Star size={14} className="text-amber-500" />
              </div>
              <span className="font-medium">95% Satisfaction</span>
            </div>
          </div>
        </motion.div>

        {/* Right -- stat cards */}
        <motion.div
          className="grid grid-cols-2 gap-4 lg:gap-5"
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: IndianRupee, value: '₹1,000', label: 'Per Interview', tone: 'emerald' },
            { icon: Calendar, value: '100%', label: 'Remote & Flexible', tone: 'blue' },
            { icon: Users, value: '100+', label: 'Expert Interviewers', tone: 'sky' },
            { icon: Clock, value: '< 48h', label: 'Fast Payouts', tone: 'violet' },
          ].map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="relative p-6 rounded-xl border border-slate-200 bg-white shadow-xl hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div
                className={cn(
                  'absolute top-0 left-0 right-0 h-1',
                  card.tone === 'emerald' && 'bg-gradient-to-r from-emerald-400 to-teal-500',
                  card.tone === 'blue' && 'bg-gradient-to-r from-blue-500 to-blue-600',
                  card.tone === 'sky' && 'bg-gradient-to-r from-sky-400 to-blue-500',
                  card.tone === 'violet' && 'bg-gradient-to-r from-violet-500 to-fuchsia-500',
                )}
              />
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm',
                  card.tone === 'emerald' && 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 ring-1 ring-emerald-200/60',
                  card.tone === 'blue' && 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 ring-1 ring-blue-200/60',
                  card.tone === 'sky' && 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600 ring-1 ring-sky-200/60',
                  card.tone === 'violet' && 'bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 ring-1 ring-violet-200/60',
                )}
              >
                <card.icon size={22} />
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

// --- How It Works ---
const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Apply Online',
      desc: 'Fill a quick application with your details and LinkedIn profile.',
      icon: Briefcase,
    },
    {
      num: '02',
      title: 'Get Verified',
      desc: 'We review your skills and conduct a short guidelines assessment.',
      icon: CheckCircle,
    },
    {
      num: '03',
      title: 'Set Your Schedule',
      desc: 'Pick the days and hours that work best for you.',
      icon: Calendar,
    },
    {
      num: '04',
      title: 'Interview & Earn',
      desc: 'Conduct interviews, submit evaluations, and get paid promptly.',
      icon: IndianRupee,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-28 bg-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            className="inline-flex px-3 py-1 mb-4 text-[11px] font-semibold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Process
          </motion.span>
          <motion.h2
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            How It{' '}
            <span className="text-blue-600">
              Works
            </span>
          </motion.h2>
          <motion.p
            className="mt-4 text-slate-500 text-lg max-w-xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Four simple steps to start earning with NxtHire
          </motion.p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx}
              variants={fadeUp}
            >
              {/* connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[58%] w-[84%] border-t-2 border-dashed border-slate-200" />
              )}

              <div className="relative bg-white rounded-3xl border border-slate-200 p-7 shadow-sm hover:shadow-xl hover:shadow-lg hover:-translate-y-1 transition-all text-center">
                <div className="relative z-10 mx-auto w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center mb-5 shadow-lg">
                  <step.icon size={26} className="text-white" />
                </div>
                <span className="text-[11px] font-bold text-blue-600 tracking-[0.18em] uppercase">
                  Step {step.num}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Benefits ---
const Benefits = () => {
  const items = [
    {
      icon: IndianRupee,
      title: 'Competitive Pay',
      desc: 'Earn up to Rs.1,000 per interview with performance-based bonuses on top.',
      color: 'orange',
    },
    {
      icon: Calendar,
      title: 'Total Flexibility',
      desc: 'Work remotely, pick your own hours, and maintain your full-time job.',
      color: 'teal',
    },
    {
      icon: Users,
      title: 'Elite Network',
      desc: 'Connect with top tech professionals from leading companies across India.',
      color: 'blue',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      desc: 'Sharpen your evaluation skills and stay current with industry trends.',
      color: 'violet',
    },
    {
      icon: Award,
      title: 'Recognition',
      desc: 'Monthly awards, public leaderboards, and badges for top performers.',
      color: 'amber',
    },
    {
      icon: Shield,
      title: 'Full Support',
      desc: 'Dedicated ops team, training resources, and a supportive community.',
      color: 'emerald',
    },
  ];

  const colorMap = {
    orange: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-emerald-200/60',
    teal:   'bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600 ring-teal-200/60',
    blue:   'bg-gradient-to-br from-blue-50 to-blue-50 text-blue-600 ring-blue-200/60',
    violet: 'bg-gradient-to-br from-violet-50 to-purple-50 text-violet-600 ring-violet-200/60',
    amber:  'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-amber-200/60',
    emerald:'bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 ring-emerald-200/60',
  };

  return (
    <section className="relative py-28 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            className="inline-flex px-3 py-1 mb-4 text-[11px] font-semibold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Why NxtHire
          </motion.span>
          <motion.h2
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Built for Busy{' '}
            <span className="text-blue-600">
              Professionals
            </span>
          </motion.h2>
          <motion.p
            className="mt-4 text-slate-500 text-lg max-w-xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Every feature designed to help you earn, learn, and grow without disrupting your day job.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              className="group relative p-8 rounded-3xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-lg hover:-translate-y-1 transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx}
              variants={fadeUp}
            >
              <div
                className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-5 ring-1 shadow-sm', colorMap[item.color])}
              >
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Testimonials ---
const Testimonials = () => {
  const reviews = [
    {
      name: 'Rajesh Kumar',
      role: 'Senior Developer, Google',
      text: 'The flexibility is incredible. I conduct interviews on weekends and it has become a meaningful second income without affecting my day job.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Tech Lead, Microsoft',
      text: 'I love mentoring candidates. Every interview is an opportunity to guide someone\'s career — and NxtWave makes the whole process seamless.',
      rating: 5,
    },
    {
      name: 'Amit Patel',
      role: 'Engineering Manager, Amazon',
      text: 'Transparent payments, easy scheduling, and a well-organized platform. Highly recommend it to any senior engineer looking for side income.',
      rating: 5,
    },
  ];

  return (
    <section className="py-28 bg-[#f5f7fb]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            className="inline-flex px-3 py-1 mb-4 text-[11px] font-semibold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Testimonials
          </motion.span>
          <motion.h2
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            What Our{' '}
            <span className="text-blue-600">
              Interviewers
            </span>{' '}
            Say
          </motion.h2>
          <motion.p
            className="mt-4 text-slate-500 text-lg max-w-xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Trusted by senior engineers from India's top tech companies
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-lg hover:-translate-y-1 transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx}
              variants={fadeUp}
            >
              <div className="absolute -top-4 left-8 w-9 h-9 rounded-xl bg-blue-600 shadow-lg flex items-center justify-center">
                <Quote size={16} className="text-white" />
              </div>

              <div className="flex gap-1 mb-4 mt-2">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-600 leading-relaxed mb-6 text-[15px]">"{r.text}"</p>

              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {r.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main ---
const Home = () => {
  const navigate = useNavigate();
  const handleApply = () => navigate('/applicationform');

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Home"
        description="Join NxtWave's interviewer community. Conduct interviews, earn ₹1,000+ per interview, and grow together on your own schedule."
        path="/"
      />
      <Hero onApply={handleApply} />
      <HowItWorks />
      <Benefits />
      <Testimonials />
    </div>
  );
};

export default Home;
