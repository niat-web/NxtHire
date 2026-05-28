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
  Clock,
  CheckCircle,
  ChevronRight,
  Shield,
} from 'lucide-react';

const ACCENT = '#C0392B';   // BRAVE crimson
const AMBER  = '#EF9F27';   // BRAVE amber dot
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

const Eyebrow = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-slate-600">
    <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: AMBER }} />
    {children}
  </span>
);

const Hero = ({ onApply }) => (
  <section className="border-b border-slate-200 bg-white">
    <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div className="grid lg:grid-cols-12 gap-12 items-end">
        <motion.div className="lg:col-span-7" initial="hidden" animate="visible" variants={fadeUp}>
          <Eyebrow>Interviewer Community</Eyebrow>

          <h1
            style={DISPLAY}
            className="mt-6 text-[44px] sm:text-[56px] lg:text-[60px] font-semibold text-slate-900 leading-[1.02] tracking-tight"
          >
            Interview work,
            <br />
            made <em className="italic" style={{ color: ACCENT }}>considered</em>.
          </h1>

          <p className="mt-6 max-w-xl text-[15px] sm:text-[16px] text-slate-600 leading-relaxed">
            Turn your industry expertise into meaningful income. Join NxtWave's interviewer community and help shape the next generation of tech talent — on your own schedule.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={onApply}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Apply now <ArrowRight size={15} />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary px-5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              How it works <ChevronRight size={15} />
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-slate-600">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-slate-500" />
              <span>Verified platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-500" />
              <span>100+ active interviewers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className="text-slate-500" />
              <span>95% satisfaction</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-5 grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: IndianRupee, value: '₹1,000', label: 'Per interview' },
            { icon: Calendar, value: '100%', label: 'Remote & flexible' },
            { icon: Users, value: '100+', label: 'Expert interviewers' },
            { icon: Clock, value: '< 48h', label: 'Fast payouts' },
          ].map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                <card.icon size={15} />
              </div>
              <p style={DISPLAY} className="mt-5 text-[32px] font-semibold text-slate-900 leading-none tracking-tight">{card.value}</p>
              <p className="mt-1.5 text-[12.5px] text-slate-500">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => {
  const steps = [
    { num: '01', title: 'Apply online', desc: 'Fill a quick application with your details and LinkedIn profile.', icon: Briefcase },
    { num: '02', title: 'Get verified', desc: 'We review your skills and conduct a short guidelines assessment.', icon: CheckCircle },
    { num: '03', title: 'Set your schedule', desc: 'Pick the days and hours that work best for you.', icon: Calendar },
    { num: '04', title: 'Interview & earn', desc: 'Conduct interviews, submit evaluations, and get paid promptly.', icon: IndianRupee },
  ];

  return (
    <section id="how-it-works" className="border-b border-slate-200 bg-white py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <Eyebrow>Process</Eyebrow>
          <h2 style={DISPLAY} className="mt-5 text-[34px] sm:text-[42px] font-semibold text-slate-900 tracking-tight leading-tight">
            How it works.
          </h2>
          <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
            Four steps from application to your first payout.
          </p>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              custom={idx}
              variants={fadeUp}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Step {step.num}
                </span>
                <step.icon size={16} className="text-slate-400" />
              </div>
              <h3 style={DISPLAY} className="mt-5 text-[22px] font-semibold text-slate-900 tracking-tight">{step.title}</h3>
              <p className="mt-2 text-[13.5px] text-slate-600 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  const items = [
    { icon: IndianRupee, title: 'Competitive pay',  desc: 'Earn up to ₹1,000 per interview with performance-based bonuses.' },
    { icon: Calendar,    title: 'Total flexibility', desc: 'Work remotely, pick your own hours, keep your day job.' },
    { icon: Users,       title: 'Elite network',    desc: 'Connect with top tech professionals from leading companies.' },
    { icon: TrendingUp,  title: 'Career growth',    desc: 'Sharpen evaluation skills and stay current with industry trends.' },
    { icon: Award,       title: 'Recognition',      desc: 'Monthly awards, public leaderboards, and badges for top performers.' },
    { icon: Shield,      title: 'Full support',     desc: 'Dedicated ops team, training resources, and a supportive community.' },
  ];

  return (
    <section className="border-b border-slate-200 bg-[#FBFAF7] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <Eyebrow>Why NxtHire</Eyebrow>
          <h2 style={DISPLAY} className="mt-5 text-[34px] sm:text-[42px] font-semibold text-slate-900 tracking-tight leading-tight">
            Built for busy professionals.
          </h2>
          <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
            Every feature designed to help you earn, learn, and grow — without disrupting your day job.
          </p>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-7"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              custom={idx}
              variants={fadeUp}
            >
              <div className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                <item.icon size={16} />
              </div>
              <h3 style={DISPLAY} className="mt-5 text-[20px] font-semibold text-slate-900 tracking-tight">{item.title}</h3>
              <p className="mt-2 text-[13.5px] text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    {
      name: 'Rajesh Kumar',
      role: 'Senior Developer, Google',
      text: 'The flexibility is incredible. I conduct interviews on weekends and it has become a meaningful second income without affecting my day job.',
    },
    {
      name: 'Priya Sharma',
      role: 'Tech Lead, Microsoft',
      text: "I love mentoring candidates. Every interview is an opportunity to guide someone's career — and NxtWave makes the whole process seamless.",
    },
    {
      name: 'Amit Patel',
      role: 'Engineering Manager, Amazon',
      text: 'Transparent payments, easy scheduling, and a well-organized platform. Highly recommend it to any senior engineer looking for side income.',
    },
  ];

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <Eyebrow>Testimonials</Eyebrow>
          <h2 style={DISPLAY} className="mt-5 text-[34px] sm:text-[42px] font-semibold text-slate-900 tracking-tight leading-tight">
            What interviewers say.
          </h2>
          <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
            Trusted by senior engineers from India's top tech companies.
          </p>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              custom={idx}
              variants={fadeUp}
            >
              <p style={DISPLAY} className="text-[22px] leading-[1.45] text-slate-900 tracking-tight">
                “{r.text}”
              </p>

              <div className="mt-auto pt-6 flex items-center gap-3 border-t border-slate-100">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-[12px]">
                  {r.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-[13.5px]">{r.name}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

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
