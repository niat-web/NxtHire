import SEO from '../../components/common/SEO';

const ACCENT = '#FF4800';
const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

const Section = ({ title, children }) => (
  <div className="mb-10 pb-8 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
    <h2 style={DISPLAY} className="text-[22px] font-semibold text-slate-900 mb-4 tracking-tight">{title}</h2>
    <div className="text-[15px] text-slate-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

const TermsOfServicePage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="Terms of Service" description="Terms of Service for NxtHire interviewer platform." path="/terms-of-service" />

    <section className="border-b border-slate-200 bg-white">
      <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-20 pb-14 lg:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          Legal
        </span>
        <h1 style={DISPLAY} className="mt-6 text-[44px] sm:text-[56px] font-semibold text-slate-900 leading-[1.05] tracking-tight">
          Terms of service.
        </h1>
        <p className="mt-4 text-slate-500 text-[13.5px]">Last updated: April 2026</p>
      </div>
    </section>

    <article className="max-w-3xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
      <Section title="1. Acceptance of terms">
        <p>By accessing or using the NxtHire platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.</p>
      </Section>

      <Section title="2. Eligibility">
        <p>To use the Platform as an interviewer, you must be at least 18 years old, possess relevant professional experience in your declared domains, and provide accurate information during the application process.</p>
      </Section>

      <Section title="3. Account registration">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. You may not share your account with others or create multiple accounts.</p>
      </Section>

      <Section title="4. Interviewer obligations">
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

      <Section title="6. Probation period">
        <p>New interviewers are placed on a probation period for their initial interviews. During probation, performance is monitored. The Platform may terminate the engagement if quality standards are not met.</p>
      </Section>

      <Section title="7. Intellectual property">
        <p>All content, materials, and evaluation frameworks on the Platform are the intellectual property of NxtWave. You may not reproduce, distribute, or create derivative works without explicit written permission.</p>
      </Section>

      <Section title="8. Termination">
        <p>Either party may terminate the engagement at any time. The Platform reserves the right to suspend or terminate accounts that violate these Terms, exhibit unprofessional conduct, or engage in fraudulent activity. Outstanding payments for completed work will be processed upon termination.</p>
      </Section>

      <Section title="9. Limitation of liability">
        <p>The Platform is provided "as is" without warranties of any kind. NxtWave shall not be liable for indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the compensation paid to you in the preceding 3 months.</p>
      </Section>

      <Section title="10. Modifications">
        <p>We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated Terms. Material changes will be communicated via email or platform notifications.</p>
      </Section>

      <Section title="11. Governing law">
        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.</p>
      </Section>

      <Section title="12. Contact">
        <p>For questions about these Terms, contact us at <a href="mailto:interviewercommunity@nxtwave.in" className="font-semibold text-slate-900 hover:text-[#FF4800] underline">interviewercommunity@nxtwave.in</a>.</p>
      </Section>
    </article>
  </div>
);

export default TermsOfServicePage;
