import SEO from '../../components/common/SEO';
import { Shield } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="mb-10 pb-8 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
    <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h2>
    <div className="text-[15px] text-slate-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

const CookiePolicyPage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="Cookie Policy" description="Cookie Policy for the NxtHire platform." path="/cookie-policy" />

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
          Cookie{' '}
          <span className="text-blue-600">
            Policy
          </span>
        </h1>
        <p className="mt-5 text-slate-500 text-base">Last updated: April 2026</p>
      </div>
    </section>

    {/* Content */}
    <article className="max-w-3xl mx-auto px-6 py-16 -mt-6 relative z-10 bg-white rounded-3xl border border-slate-200 shadow-xl lg:px-12 mb-24">
      <Section title="1. What Are Cookies?">
        <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.</p>
      </Section>

      <Section title="2. How We Use Cookies">
        <p>The NxtHire platform uses cookies for the following purposes:</p>
        <ul className="list-disc ml-5 space-y-1.5">
          <li><strong>Essential Cookies:</strong> Required for the Platform to function. These include authentication tokens that keep you logged in and session cookies for security.</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences such as language, timezone, and display settings to provide a personalized experience.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform so we can improve performance and user experience. These collect anonymized usage data.</li>
        </ul>
      </Section>

      <Section title="3. Types of Cookies We Use">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">Cookie</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">Type</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">Purpose</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr className="hover:bg-slate-50/70 transition-colors"><td className="px-5 py-3 font-semibold text-slate-900">auth_token</td><td className="px-5 py-3 text-slate-600">Essential</td><td className="px-5 py-3 text-slate-600">Authentication</td><td className="px-5 py-3 text-slate-600">7 days</td></tr>
              <tr className="hover:bg-slate-50/70 transition-colors"><td className="px-5 py-3 font-semibold text-slate-900">session_id</td><td className="px-5 py-3 text-slate-600">Essential</td><td className="px-5 py-3 text-slate-600">Session management</td><td className="px-5 py-3 text-slate-600">Session</td></tr>
              <tr className="hover:bg-slate-50/70 transition-colors"><td className="px-5 py-3 font-semibold text-slate-900">preferences</td><td className="px-5 py-3 text-slate-600">Functional</td><td className="px-5 py-3 text-slate-600">User preferences</td><td className="px-5 py-3 text-slate-600">1 year</td></tr>
              <tr className="hover:bg-slate-50/70 transition-colors"><td className="px-5 py-3 font-semibold text-slate-900">_ga</td><td className="px-5 py-3 text-slate-600">Analytics</td><td className="px-5 py-3 text-slate-600">Usage tracking</td><td className="px-5 py-3 text-slate-600">2 years</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="4. Third-Party Cookies">
        <p>We may use third-party services (such as Google Analytics) that set their own cookies. These are governed by the respective third party's privacy policies. We do not control these cookies.</p>
      </Section>

      <Section title="5. Managing Cookies">
        <p>You can manage or delete cookies through your browser settings. Most browsers allow you to block or delete cookies. However, disabling essential cookies may prevent the Platform from functioning correctly.</p>
        <p>Common browser cookie settings:</p>
        <ul className="list-disc ml-5 space-y-1.5">
          <li>Chrome: Settings &gt; Privacy and Security &gt; Cookies</li>
          <li>Firefox: Settings &gt; Privacy &amp; Security &gt; Cookies</li>
          <li>Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
          <li>Edge: Settings &gt; Cookies and Site Permissions</li>
        </ul>
      </Section>

      <Section title="6. Updates to This Policy">
        <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. The updated date at the top of this page indicates when the policy was last revised.</p>
      </Section>

      <Section title="7. Contact Us">
        <p>If you have questions about our use of cookies, please contact us at <a href="mailto:interviewercommunity@nxtwave.in" className="font-semibold text-blue-600 hover:underline">interviewercommunity@nxtwave.in</a>.</p>
      </Section>
    </article>
  </div>
);

export default CookiePolicyPage;
