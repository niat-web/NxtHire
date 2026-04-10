import { Helmet } from 'react-helmet-async';

const defaults = {
  title: 'NxtHire — Interviewer Hiring & Management Platform',
  description: 'Join NxtWave\'s interviewer community. Conduct interviews, earn ₹1,000+ per interview, manage schedules, and grow together.',
  url: 'https://nxthire.vercel.app',
};

const SEO = ({ title, description, path }) => {
  const pageTitle = title ? `${title} | NxtHire` : defaults.title;
  const pageDesc = description || defaults.description;
  const pageUrl = path ? `${defaults.url}${path}` : defaults.url;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
    </Helmet>
  );
};

export default SEO;
