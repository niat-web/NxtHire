import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Users,
  Briefcase,
  TrendingUp,
  Star,
  Award,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Check,
  ChevronRight,
  Circle,
  Play
} from 'lucide-react';

// Diagonal Split Hero - Completely New Design
const DiagonalHero = ({ onApplyNowClick }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-900">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: [1, 1.2, 1],
        }}
        transition={{ scale: { duration: 8, repeat: Infinity } }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl"
        animate={{
          x: -mousePosition.x,
          y: -mousePosition.y,
          scale: [1.2, 1, 1.2],
        }}
        transition={{ scale: { duration: 10, repeat: Infinity } }}
      />

      <div className="relative z-10">
        <div className="container mx-auto px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-block mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full">
                  💼 FOR TECH EXPERTS
                </span>
              </motion.div>

              <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="block text-white">Interview.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Impact.
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                  Inspire.
                </span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                Turn your industry expertise into{' '}
                <span className="text-orange-400 font-bold">meaningful income</span>.
                Shape the next generation of tech talent on{' '}
                <span className="text-teal-400 font-bold">your schedule</span>.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  onClick={onApplyNowClick}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    Start Earning Now
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={20} />
                    </motion.span>
                  </span>
                </motion.button>

                <motion.button
                  className="px-8 py-4 bg-slate-800/50 text-white font-bold rounded-xl border-2 border-slate-700 hover:border-teal-500 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <Play size={18} />
                    Watch How It Works
                  </span>
                </motion.button>
              </div>

              {/* Quick Stats Inline */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-800">
                <div>
                  <div className="text-4xl font-bold text-orange-400">₹1000</div>
                  <div className="text-sm text-slate-400">Per Interview</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-teal-400">100+</div>
                  <div className="text-sm text-slate-400">Interviewers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-400">24/7</div>
                  <div className="text-sm text-slate-400">Flexibility</div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Feature Cards */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: DollarSign, title: "Top Pay", desc: "Competitive rates", color: "orange" },
                  { icon: Calendar, title: "Flexible", desc: "Your schedule", color: "teal" },
                  { icon: Users, title: "Elite Network", desc: "Top professionals", color: "cyan" },
                  { icon: Target, title: "High Impact", desc: "Shape careers", color: "amber" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="p-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center mb-4`}>
                      <item.icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Diagonal Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 text-slate-900" preserveAspectRatio="none" viewBox="0 0 1440 74" fill="currentColor">
          <path d="M0,0 L1440,74 L1440,74 L0,74 Z" />
        </svg>
      </div>
    </section>
  );
};

// Magazine-Style Process Section
const ProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const steps = [
    {
      num: "01",
      title: "Apply & Verify",
      desc: "Quick application with instant verification of your technical expertise",
      icon: Check,
      color: "from-orange-500 to-orange-600"
    },
    {
      num: "02",
      title: "Set Availability",
      desc: "Choose when you want to conduct interviews - complete freedom",
      icon: Calendar,
      color: "from-teal-500 to-teal-600"
    },
    {
      num: "03",
      title: "Conduct Interviews",
      desc: "Evaluate candidates and provide valuable feedback that shapes careers",
      icon: Users,
      color: "from-cyan-500 to-cyan-600"
    },
    {
      num: "04",
      title: "Get Paid Fast",
      desc: "Receive competitive compensation directly to your account",
      icon: DollarSign,
      color: "from-amber-500 to-amber-600"
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-5xl lg:text-6xl font-black text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
          >
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Works</span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Four simple steps to start making an impact
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
            >
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent z-0" />
              )}

              <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700 group-hover:border-orange-500/50 transition-all h-full">
                <div className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <step.icon className="text-white" size={20} />
                </div>

                <div className="text-6xl font-black text-slate-700 mb-4">{step.num}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>

                <div className="mt-6 flex items-center text-orange-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Horizontal Scroll perks Section
const PerksSection = () => {
  const scrollRef = useRef(null);

  const perks = [
    {
      title: "Premium Earning Potential",
      amount: "Up to ₹1,500",
      desc: "Earn competitive rates per interview with performance bonuses",
      stats: ["Instant payments", "Transparent pricing", "Bonus rewards"],
      gradient: "from-orange-500/20 to-orange-600/20",
      icon: DollarSign,
      border: "border-orange-500/30"
    },
    {
      title: "Ultimate Flexibility",
      amount: "100% Remote",
      desc: "Work from anywhere, anytime that suits your lifestyle",
      stats: ["Choose your hours", "No minimum", "Global access"],
      gradient: "from-teal-500/20 to-teal-600/20",
      icon: Calendar,
      border: "border-teal-500/30"
    },
    {
      title: "Elite Community",
      amount: "100+ Experts",
      desc: "Network with top professionals from leading tech companies",
      stats: ["Exclusive events", "Knowledge sharing", "Industry insights"],
      gradient: "from-cyan-500/20 to-cyan-600/20",
      icon: Users,
      border: "border-cyan-500/30"
    },
    {
      title: "Skill Development",
      amount: "Continuous Growth",
      desc: "Enhance your evaluation skills and stay current with trends",
      stats: ["Training programs", "Certification", "Expert mentoring"],
      gradient: "from-amber-500/20 to-amber-600/20",
      icon: Target,
      border: "border-amber-500/30"
    },
    {
      title: "Recognition & Awards",
      amount: "Top Performer",
      desc: "Get recognized for your contributions and excellence",
      stats: ["Monthly awards", "Public profile", "Badge system"],
      gradient: "from-purple-500/20 to-purple-600/20",
      icon: Award,
      border: "border-purple-500/30"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <h2 className="text-5xl lg:text-6xl font-black text-white mb-4">
          Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">NxtWave</span>
        </h2>
        <p className="text-xl text-slate-400">Unmatched benefits designed for you</p>
      </div>

      <div ref={scrollRef} className="flex gap-6 px-6 overflow-x-auto pb-8 scrollbar-hide">
        {perks.map((perk, idx) => (
          <motion.div
            key={idx}
            className={`min-w-[400px] bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border ${perk.border} hover:scale-105 transition-all`}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${perk.gradient} border ${perk.border} flex items-center justify-center mb-6`}>
              <perk.icon className="text-white" size={32} />
            </div>

            <div className="mb-4">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
                {perk.amount}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{perk.title}</h3>
              <p className="text-slate-400 mb-6">{perk.desc}</p>
            </div>

            <div className="space-y-2">
              {perk.stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <Circle className="text-orange-400" size={8} fill="currentColor" />
                  <span className="text-sm">{stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Testimonials with Asymmetric Layout
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Senior Developer at Google",
      text: "The flexibility is unmatched. I can contribute to the tech community while maintaining my full-time job.",
      rating: 5,
      earnings: "₹45K+",
      period: "last month"
    },
    {
      name: "Priya Sharma",
      role: "Tech Lead at Microsoft",
      text: "I love the impact I'm making. Every interview is an opportunity to shape someone's career.",
      rating: 5,
      earnings: "₹60K+",
      period: "last month"
    },
    {
      name: "Amit Patel",
      role: "Engineering Manager at Amazon",
      text: "Quick payments, great platform, and meaningful work. Couldn't ask for more!",
      rating: 5,
      earnings: "₹38K+",
      period: "last month"
    }
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Industry Leaders</span>
          </h2>
          <p className="text-xl text-slate-400">See what our interviewers have to say</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-orange-500/50 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-amber-400" size={20} fill="currentColor" />
                ))}
              </div>

              <p className="text-slate-300 mb-6 italic">"{testimonial.text}"</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name[0]}
                </div>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Earnings ({testimonial.period})</span>
                  <span className="text-xl font-bold text-teal-400">{testimonial.earnings}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Bold CTA Section with Different Design
const CTASection = ({ onApplyNowClick }) => {
  return (
    <section className="py-32 bg-gradient-to-br from-orange-950/30 via-slate-900 to-teal-950/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-tight">
              Ready to Make
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400">
                Your Impact?
              </span>
            </h2>

            <p className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Join <span className="font-bold text-orange-400">100+ tech experts</span> who are already earning while shaping the future of technology
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <motion.button
                onClick={onApplyNowClick}
                className="px-12 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xl font-bold rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-2xl shadow-orange-500/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  Apply Now - It's Free
                  <ArrowRight size={24} />
                </span>
              </motion.button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="text-teal-400" size={20} />
                <span>No upfront costs</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-teal-400" size={20} />
                <span>Quick approval</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-teal-400" size={20} />
                <span>Start earning today</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Main Home Component
const Home = () => {
  const navigate = useNavigate();

  const handleApplyNowClick = () => {
    navigate('/applicationform');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white antialiased overflow-x-hidden">
      <DiagonalHero onApplyNowClick={handleApplyNowClick} />
      <ProcessSection />
      <PerksSection />
      <TestimonialsSection />
      <CTASection onApplyNowClick={handleApplyNowClick} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f97316, #fb923c);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ea580c, #f97316);
        }

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: rgba(249, 115, 22, 0.3);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Home;
