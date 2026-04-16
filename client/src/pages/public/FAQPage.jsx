import { useState } from 'react';
import { ChevronDown, Search, Sparkles, Mail, ArrowRight } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { cn } from '@/lib/utils';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'Who can become an interviewer on NxtHire?', a: 'Any experienced tech professional with 2+ years of industry experience can apply. We welcome software engineers, data scientists, cloud architects, and other domain experts.' },
      { q: 'How do I apply to become an interviewer?', a: 'Click the "Apply Now" button on the homepage, fill in your details including LinkedIn profile, work experience, and preferred domains. Our team will review your application within 3-5 business days.' },
      { q: 'Is there a fee to join?', a: 'No. Joining NxtHire as an interviewer is completely free. There are no upfront costs or hidden charges.' },
      { q: 'What happens after I apply?', a: 'Your application goes through LinkedIn review, skills assessment, and guidelines review. Once approved, you will receive a welcome email with onboarding instructions.' },
    ],
  },
  {
    category: 'Interviews & Scheduling',
    items: [
      { q: 'How are interviews assigned to me?', a: 'When a new interview booking is created, you will receive a notification. You can submit your available time slots, and the admin team will finalize the schedule based on availability.' },
      { q: 'Can I choose which domains I interview for?', a: 'Yes. During onboarding, you select your preferred domains. You will only receive interview requests for domains you are qualified in.' },
      { q: 'What if I need to cancel an interview?', a: 'You can decline a booking request with a reason. However, frequent cancellations may affect your status on the platform.' },
      { q: 'How long is each interview?', a: 'Most interviews are 45-60 minutes long, depending on the domain and evaluation requirements.' },
    ],
  },
  {
    category: 'Payments & Earnings',
    items: [
      { q: 'How much do I earn per interview?', a: 'Compensation varies by domain and interview type, but our interviewers typically earn competitive rates per interview. Exact amounts are communicated during onboarding.' },
      { q: 'When do I get paid?', a: 'Payments are processed monthly. You will receive a payment email with details, and the amount is transferred to your registered bank account.' },
      { q: 'Can I track my earnings?', a: 'Yes. The Payment Details section in your dashboard shows your complete earnings history, including per-interview breakdowns and monthly totals.' },
    ],
  },
  {
    category: 'Account & Support',
    items: [
      { q: 'How do I update my profile or bank details?', a: 'Go to Settings > Profile in your dashboard to update personal information, or Settings > Security to change your password.' },
      { q: 'What is the probation period?', a: 'New interviewers start on probation for their first 5 interviews. After successful completion, your status is upgraded to Active.' },
      { q: 'Who do I contact for support?', a: 'You can reach our team at interviewercommunity@nxtwave.in or through the WhatsApp support widget available in your dashboard.' },
    ],
  },
];

const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-slate-100 last:border-0">
    <button onClick={onToggle} className="w-full flex items-center justify-between py-5 px-1 text-left group gap-4">
      <span className={cn('text-[15px] font-semibold transition-colors', isOpen ? 'text-slate-900' : 'text-slate-800 group-hover:text-blue-600')}>{question}</span>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
        isOpen ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
      )}>
        <ChevronDown size={15} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </div>
    </button>
    <div className={cn('overflow-hidden transition-all duration-300', isOpen ? 'max-h-96 pb-5' : 'max-h-0')}>
      <p className="text-[14px] text-slate-500 leading-relaxed px-1">{answer}</p>
    </div>
  </div>
);

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  const toggle = (key) => setOpenIndex(prev => prev === key ? null : key);

  return (
    <div className="min-h-screen bg-white">
      <SEO title="FAQ" description="Frequently asked questions about becoming an interviewer on NxtHire." path="/faq" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f5f7fb] pt-32 pb-20 lg:pt-40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-200/50 blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(15,23,42,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.5) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold tracking-wide uppercase text-blue-700 bg-white border border-blue-200 rounded-full shadow-sm">
            <Sparkles size={13} className="text-blue-500" />
            Support Center
          </span>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
            Frequently Asked{' '}
            <span className="text-blue-600">
              Questions
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Find answers to common questions about joining, interviewing, and earning on NxtHire.
          </p>

          <div className="mt-10 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 shadow-xl focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 transition-all"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">No questions match your search.</p>
            <p className="text-sm text-slate-400 mt-1">Try a different keyword.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredFaqs.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                    {cat.category}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow px-6 lg:px-7">
                  {cat.items.map((item, i) => {
                    const key = `${cat.category}-${i}`;
                    return <AccordionItem key={key} question={item.q} answer={item.a} isOpen={openIndex === key} onToggle={() => toggle(key)} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Still have questions */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-xl mb-6">
            <Mail className="text-white" size={22} />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.1]">
            Still have{' '}
            <span className="text-blue-300">
              questions?
            </span>
          </h2>
          <p className="mt-4 text-slate-300 text-base max-w-md mx-auto">
            Reach out to our team and we'll get back to you within 24 hours.
          </p>
          <a
            href="mailto:interviewercommunity@nxtwave.in"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xl transition-all hover:-translate-y-0.5"
          >
            interviewercommunity@nxtwave.in <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
