import { useState } from 'react';
import { ChevronDown, Search, Mail, ArrowRight } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { cn } from '@/lib/utils';

const ACCENT = '#C0392B';
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const Eyebrow = ({ children, dark }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em]',
    dark ? 'border border-white/20 bg-white/5 text-muted-foreground/40' : 'border border-border bg-white text-foreground/80'
  )}>
    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
    {children}
  </span>
);

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
  <div className="border-b border-border last:border-0">
    <button onClick={onToggle} className="w-full flex items-center justify-between py-5 text-left group gap-4">
      <span className={cn('text-[15px] font-semibold transition-colors', isOpen ? 'text-foreground' : 'text-foreground group-hover:text-[#C0392B]')}>{question}</span>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors',
        isOpen ? 'bg-primary text-white' : 'border border-border text-muted-foreground group-hover:border-primary group-hover:text-foreground'
      )}>
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </div>
    </button>
    <div className={cn('overflow-hidden transition-all duration-300', isOpen ? 'max-h-96 pb-5' : 'max-h-0')}>
      <p className="text-[14px] text-foreground/80 leading-relaxed pr-10">{answer}</p>
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

      <section className="border-b border-border bg-white">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-20 pb-14 lg:pt-24">
          <Eyebrow>Support Center</Eyebrow>
          <h1 style={DISPLAY} className="mt-6 text-[44px] sm:text-[56px] font-semibold text-foreground leading-[1.05] tracking-tight">
            Frequently asked <em className="italic" style={{ color: ACCENT }}>questions</em>.
          </h1>
          <p className="mt-5 text-[15px] sm:text-[16px] text-foreground/80 max-w-xl leading-relaxed">
            Find answers to common questions about joining, interviewing, and earning on NxtHire.
          </p>

          <div className="mt-9 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions"
              className="w-full h-11 pl-11 pr-4 bg-white border border-border rounded-full text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-12 w-12 rounded-full border border-border bg-white inline-flex items-center justify-center mb-4 text-muted-foreground/70">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-foreground font-semibold text-[14px]">No questions match your search.</p>
              <p className="text-[13px] text-muted-foreground mt-1">Try a different keyword.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredFaqs.map(cat => (
                <div key={cat.category}>
                  <div className="flex items-center gap-3 mb-4">
                    <Eyebrow>{cat.category}</Eyebrow>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <div className="bg-white rounded-2xl border border-border px-6 lg:px-7">
                    {cat.items.map((item, i) => {
                      const key = `${cat.category}-${i}`;
                      return <AccordionItem key={key} question={item.q} answer={item.a} isOpen={openIndex === key} onToggle={() => toggle(key)} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 py-20 lg:py-24 text-center">
          <Eyebrow dark>Contact</Eyebrow>
          <h2 style={DISPLAY} className="mt-6 text-[34px] sm:text-[48px] font-semibold text-white tracking-tight leading-[1.08]">
            Still have <em className="italic" style={{ color: ACCENT }}>questions</em>?
          </h2>
          <p className="mt-5 text-muted-foreground/40 text-[15px] max-w-md mx-auto leading-relaxed">
            Reach out to our team and we'll get back to you within 24 hours.
          </p>
          <a
            href="mailto:interviewercommunity@nxtwave.in"
            className="mt-8 inline-flex items-center gap-2 h-11 px-6 rounded-full text-[13px] font-semibold text-foreground bg-white hover:bg-primary/90 hover:text-white transition-colors"
          >
            <Mail size={14} /> interviewercommunity@nxtwave.in <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
