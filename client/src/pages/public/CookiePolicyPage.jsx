import SEO from '../../components/common/SEO';

const ACCENT = '#C0392B';
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const Section = ({ title, children }) => (
  <div className="mb-10 pb-8 border-b border-border last:border-0 last:pb-0 last:mb-0">
    <h2 style={DISPLAY} className="text-[22px] font-semibold text-foreground mb-4 tracking-tight">{title}</h2>
    <div className="text-[15px] text-foreground/80 leading-relaxed space-y-3">{children}</div>
  </div>
);

const CookiePolicyPage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="Cookie Policy" description="Cookie Policy for the NxtHire platform." path="/cookie-policy" />

    <section className="border-b border-border bg-white">
      <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-20 pb-14 lg:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          Legal
        </span>
        <h1 style={DISPLAY} className="mt-6 text-[44px] sm:text-[56px] font-semibold text-foreground leading-[1.05] tracking-tight">
          Cookie policy.
        </h1>
        <p className="mt-4 text-muted-foreground text-[13.5px]">Last updated: April 2026</p>
      </div>
    </section>

    <article className="max-w-3xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
      <Section title="1. What are cookies?">
        <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.</p>
      </Section>

      <Section title="2. How we use cookies">
        <p>The NxtHire platform uses cookies for the following purposes:</p>
        <ul className="list-disc ml-5 space-y-1.5">
          <li><strong>Essential cookies:</strong> Required for the Platform to function. These include authentication tokens that keep you logged in and session cookies for security.</li>
          <li><strong>Functional cookies:</strong> Remember your preferences such as language, timezone, and display settings to provide a personalized experience.</li>
          <li><strong>Analytics cookies:</strong> Help us understand how users interact with the Platform so we can improve performance and user experience. These collect anonymized usage data.</li>
        </ul>
      </Section>

      <Section title="3. Types of cookies we use">
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="min-w-full text-[13px]">
            <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Cookie</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Purpose</th>
                <th className="px-5 py-3 text-left">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30 transition-colors"><td className="px-5 py-3.5 font-semibold text-foreground">auth_token</td><td className="px-5 py-3.5 text-foreground/90">Essential</td><td className="px-5 py-3.5 text-foreground/90">Authentication</td><td className="px-5 py-3.5 text-foreground/90">7 days</td></tr>
              <tr className="hover:bg-muted/30 transition-colors"><td className="px-5 py-3.5 font-semibold text-foreground">session_id</td><td className="px-5 py-3.5 text-foreground/90">Essential</td><td className="px-5 py-3.5 text-foreground/90">Session management</td><td className="px-5 py-3.5 text-foreground/90">Session</td></tr>
              <tr className="hover:bg-muted/30 transition-colors"><td className="px-5 py-3.5 font-semibold text-foreground">preferences</td><td className="px-5 py-3.5 text-foreground/90">Functional</td><td className="px-5 py-3.5 text-foreground/90">User preferences</td><td className="px-5 py-3.5 text-foreground/90">1 year</td></tr>
              <tr className="hover:bg-muted/30 transition-colors"><td className="px-5 py-3.5 font-semibold text-foreground">_ga</td><td className="px-5 py-3.5 text-foreground/90">Analytics</td><td className="px-5 py-3.5 text-foreground/90">Usage tracking</td><td className="px-5 py-3.5 text-foreground/90">2 years</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="4. Third-party cookies">
        <p>We may use third-party services (such as Google Analytics) that set their own cookies. These are governed by the respective third party's privacy policies. We do not control these cookies.</p>
      </Section>

      <Section title="5. Managing cookies">
        <p>You can manage or delete cookies through your browser settings. Most browsers allow you to block or delete cookies. However, disabling essential cookies may prevent the Platform from functioning correctly.</p>
        <p>Common browser cookie settings:</p>
        <ul className="list-disc ml-5 space-y-1.5">
          <li>Chrome: Settings &gt; Privacy and Security &gt; Cookies</li>
          <li>Firefox: Settings &gt; Privacy &amp; Security &gt; Cookies</li>
          <li>Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
          <li>Edge: Settings &gt; Cookies and Site Permissions</li>
        </ul>
      </Section>

      <Section title="6. Updates to this policy">
        <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. The updated date at the top of this page indicates when the policy was last revised.</p>
      </Section>

      <Section title="7. Contact us">
        <p>If you have questions about our use of cookies, please contact us at <a href="mailto:interviewercommunity@nxtwave.in" className="font-semibold text-foreground hover:text-[#C0392B] underline">interviewercommunity@nxtwave.in</a>.</p>
      </Section>
    </article>
  </div>
);

export default CookiePolicyPage;
