import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

// ─── Hero ────────────────────────────────────────────────────────────────────
const Hero = ({ onApply }) => (
  <section className="relative bg-white overflow-hidden">
    {/* subtle background pattern */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-50 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-50 translate-y-1/2 -translate-x-1/3" />
    </div>

    <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full">
            Now Accepting Applications
          </span>

          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Conduct Interviews.{' '}
            <span className="text-emerald-600">Earn Well.</span>{' '}
            <span className="text-teal-600">Grow Together.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg">
            Turn your industry expertise into meaningful income. Join NxtWave's interviewer community and help shape the next generation of tech talent — on your own schedule.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={onApply}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
            >
              Apply Now <ArrowRight size={18} />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              How It Works <ChevronRight size={18} />
            </a>
          </div>

          {/* trust strip */}
          <div className="mt-12 flex items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-teal-500" />
              <span>Verified Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-teal-500" />
              <span>100+ Active Interviewers</span>
            </div>
          </div>
        </motion.div>

        {/* Right — stat cards */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: IndianRupee, value: '1,000', label: 'Per Interview', color: 'orange' },
            { icon: Calendar, value: '100%', label: 'Remote & Flexible', color: 'teal' },
            { icon: Users, value: '100+', label: 'Expert Interviewers', color: 'blue' },
            { icon: Clock, value: '< 48 hrs', label: 'Fast Payouts', color: 'violet' },
          ].map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className={`p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4
                  ${card.color === 'orange' ? 'bg-emerald-50 text-emerald-600' : ''}
                  ${card.color === 'teal' ? 'bg-teal-50 text-teal-500' : ''}
                  ${card.color === 'blue' ? 'bg-emerald-50 text-emerald-500' : ''}
                  ${card.color === 'violet' ? 'bg-violet-50 text-violet-500' : ''}
                `}
              >
                <card.icon size={22} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-400 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

// ─── How It Works ────────────────────────────────────────────────────────────
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
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-extrabold text-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="mt-3 text-gray-500 text-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Four simple steps to start earning
          </motion.p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="relative text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx}
              variants={fadeUp}
            >
              {/* connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
              )}

              <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mb-5">
                <step.icon size={26} className="text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-500 tracking-widest uppercase">
                Step {step.num}
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Benefits ────────────────────────────────────────────────────────────────
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
    orange: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    teal: 'bg-teal-50 text-teal-500 border-teal-100',
    blue: 'bg-emerald-50 text-emerald-500 border-emerald-100',
    violet: 'bg-violet-50 text-violet-500 border-violet-100',
    amber: 'bg-amber-50 text-amber-500 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100',
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-extrabold text-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Why Join NxtWave?
          </motion.h2>
          <motion.p
            className="mt-3 text-gray-500 text-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Benefits designed for busy professionals
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              className="group p-7 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white hover:shadow-lg transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx}
              variants={fadeUp}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${colorMap[item.color]}`}
              >
                <item.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Testimonials ────────────────────────────────────────────────────────────
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
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-extrabold text-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            What Our Interviewers Say
          </motion.h2>
          <motion.p
            className="mt-3 text-gray-500 text-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Trusted by professionals across India
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx}
              variants={fadeUp}
            >
              <Quote size={28} className="text-emerald-100 mb-4" />

              <p className="text-gray-600 leading-relaxed mb-6">"{r.text}"</p>

              <div className="flex gap-1 mb-4">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm">
                  {r.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA ─────────────────────────────────────────────────────────────────────
const CTA = ({ onApply }) => (
  <section className="py-24 bg-gradient-to-br from-emerald-600 to-emerald-700 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>

    <div className="relative max-w-3xl mx-auto px-6 text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <Sparkles className="mx-auto mb-6 text-emerald-200" size={36} />

        <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Ready to Start Earning?
        </h2>

        <p className="mt-5 text-emerald-100 text-lg max-w-xl mx-auto">
          Join 100+ tech experts who are already earning while shaping the future of technology. It takes less than 5 minutes to apply.
        </p>

        <button
          onClick={onApply}
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
        >
          Apply Now — It's Free <ArrowRight size={18} />
        </button>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-emerald-100 text-sm">
          <span className="flex items-center gap-1.5">
            <CheckCircle size={16} /> No upfront costs
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={16} /> Quick approval
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={16} /> Start earning this week
          </span>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const handleApply = () => navigate('/applicationform');

  return (
    <div className="min-h-screen bg-white">
      <Hero onApply={handleApply} />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <CTA onApply={handleApply} />
    </div>
  );
};

export default Home;
