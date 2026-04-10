import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
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
  <div className="border-b border-gray-100 last:border-0">
    <button onClick={onToggle} className="w-full flex items-center justify-between py-4 px-1 text-left group">
      <span className={cn('text-sm font-medium transition-colors', isOpen ? 'text-indigo-600' : 'text-gray-900 group-hover:text-indigo-600')}>{question}</span>
      <ChevronDown size={16} className={cn('text-gray-400 transition-transform shrink-0 ml-4', isOpen && 'rotate-180 text-indigo-500')} />
    </button>
    <div className={cn('overflow-hidden transition-all duration-200', isOpen ? 'max-h-40 pb-4' : 'max-h-0')}>
      <p className="text-sm text-gray-500 leading-relaxed px-1">{answer}</p>
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
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">Support</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold">Frequently Asked Questions</h1>
          <p className="mt-3 text-indigo-100 max-w-lg mx-auto">Find answers to common questions about joining, interviewing, and earning on NxtHire.</p>

          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-indigo-200 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No questions match your search.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredFaqs.map(cat => (
              <div key={cat.category}>
                <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-4">{cat.category}</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5">
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
      <section className="bg-gray-50 py-14">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-sm text-gray-500 mb-4">Reach out to our team and we'll get back to you within 24 hours.</p>
          <a href="mailto:interviewercommunity@nxtwave.in" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            interviewercommunity@nxtwave.in
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
