import SEO from '../../components/common/SEO';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

const CookiePolicyPage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="Cookie Policy" description="Cookie Policy for the NxtHire platform." path="/cookie-policy" />

    {/* Header */}
    <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white py-16">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-3xl lg:text-4xl font-extrabold">Cookie Policy</h1>
        <p className="mt-3 text-indigo-100">Last updated: April 2026</p>
      </div>
    </section>

    {/* Content */}
    <article className="max-w-3xl mx-auto px-6 py-16">
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Cookie</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Purpose</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/80"><td className="px-4 py-2.5 text-gray-700">auth_token</td><td className="px-4 py-2.5">Essential</td><td className="px-4 py-2.5">Authentication</td><td className="px-4 py-2.5">7 days</td></tr>
              <tr className="hover:bg-gray-50/80"><td className="px-4 py-2.5 text-gray-700">session_id</td><td className="px-4 py-2.5">Essential</td><td className="px-4 py-2.5">Session management</td><td className="px-4 py-2.5">Session</td></tr>
              <tr className="hover:bg-gray-50/80"><td className="px-4 py-2.5 text-gray-700">preferences</td><td className="px-4 py-2.5">Functional</td><td className="px-4 py-2.5">User preferences</td><td className="px-4 py-2.5">1 year</td></tr>
              <tr className="hover:bg-gray-50/80"><td className="px-4 py-2.5 text-gray-700">_ga</td><td className="px-4 py-2.5">Analytics</td><td className="px-4 py-2.5">Usage tracking</td><td className="px-4 py-2.5">2 years</td></tr>
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
        <p>If you have questions about our use of cookies, please contact us at <a href="mailto:interviewercommunity@nxtwave.in" className="text-indigo-600 hover:underline">interviewercommunity@nxtwave.in</a>.</p>
      </Section>
    </article>
  </div>
);

export default CookiePolicyPage;
