import SEO from '../../components/common/SEO';
import { Shield } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="mb-10 pb-8 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
    <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h2>
    <div className="text-[15px] text-slate-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

const TermsOfServicePage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="Terms of Service" description="Terms of Service for NxtHire interviewer platform." path="/terms-of-service" />

    {/* Header */}
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
          <Shield size={13} className="text-blue-500" />
          Legal
        </span>
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
          Terms of{' '}
          <span className="text-blue-600">
            Service
          </span>
        </h1>
        <p className="mt-5 text-slate-500 text-base">Last updated: April 2026</p>
      </div>
    </section>

    {/* Content */}
    <article className="max-w-3xl mx-auto px-6 py-16 -mt-6 relative z-10 bg-white rounded-3xl border border-slate-200 shadow-xl lg:px-12 mb-24">
      <Section title="1. Acceptance of Terms">
        <p>By accessing or using the NxtHire platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.</p>
      </Section>

      <Section title="2. Eligibility">
        <p>To use the Platform as an interviewer, you must be at least 18 years old, possess relevant professional experience in your declared domains, and provide accurate information during the application process.</p>
      </Section>

      <Section title="3. Account Registration">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. You may not share your account with others or create multiple accounts.</p>
      </Section>

      <Section title="4. Interviewer Obligations">
        <p>As an interviewer on the Platform, you agree to:</p>
        <ul className="list-disc ml-5 space-y-1.5">
          <li>Conduct interviews professionally, fairly, and without bias</li>
          <li>Maintain confidentiality of all candidate information</li>
          <li>Submit evaluations accurately and promptly</li>
          <li>Honour confirmed interview schedules and provide timely availability</li>
          <li>Follow the evaluation guidelines provided by the Platform</li>
          <li>Not record, share, or distribute interview content without authorization</li>
        </ul>
      </Section>

      <Section title="5. Compensation">
        <p>Interviewer compensation rates are communicated during onboarding and may vary by domain and interview type. Payments are processed on a monthly cycle. The Platform reserves the right to adjust compensation with prior notice.</p>
        <p>Bonus amounts, if applicable, are determined at the Platform's discretion. Disputes regarding payments must be raised within 30 days of the payment cycle.</p>
      </Section>

      <Section title="6. Probation Period">
        <p>New interviewers are placed on a probation period for their initial interviews. During probation, performance is monitored. The Platform may terminate the engagement if quality standards are not met.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>All content, materials, and evaluation frameworks on the Platform are the intellectual property of NxtWave. You may not reproduce, distribute, or create derivative works without explicit written permission.</p>
      </Section>

      <Section title="8. Termination">
        <p>Either party may terminate the engagement at any time. The Platform reserves the right to suspend or terminate accounts that violate these Terms, exhibit unprofessional conduct, or engage in fraudulent activity. Outstanding payments for completed work will be processed upon termination.</p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>The Platform is provided "as is" without warranties of any kind. NxtWave shall not be liable for indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the compensation paid to you in the preceding 3 months.</p>
      </Section>

      <Section title="10. Modifications">
        <p>We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated Terms. Material changes will be communicated via email or platform notifications.</p>
      </Section>

      <Section title="11. Governing Law">
        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.</p>
      </Section>

      <Section title="12. Contact">
        <p>For questions about these Terms, contact us at <a href="mailto:interviewercommunity@nxtwave.in" className="font-semibold text-blue-600 hover:underline">interviewercommunity@nxtwave.in</a>.</p>
      </Section>
    </article>
  </div>
);

export default TermsOfServicePage;
