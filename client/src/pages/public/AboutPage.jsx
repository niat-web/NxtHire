import { Link } from 'react-router-dom';
import { Users, Target, Award, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { Button } from '@/components/ui/button';

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We connect skilled professionals with opportunities to evaluate and mentor the next generation of tech talent.' },
  { icon: Users, title: 'Community First', description: 'Our interviewers are more than contractors — they are part of a growing community of industry experts.' },
  { icon: Award, title: 'Quality Standards', description: 'Every interview is conducted with rigorous standards ensuring fair, unbiased, and thorough evaluation.' },
  { icon: Briefcase, title: 'Flexible Work', description: 'Set your own schedule, choose your domains, and earn competitive pay on your own terms.' },
];

const stats = [
  { value: '100+', label: 'Active Interviewers' },
  { value: '5,000+', label: 'Interviews Conducted' },
  { value: '15+', label: 'Tech Domains' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const AboutPage = () => (
  <div className="min-h-screen bg-white">
    <SEO title="About Us" description="Learn about NxtHire — our mission, values, and the team behind the interviewer community platform." path="/about" />

    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">About NxtHire</p>
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">Building the Future of<br />Technical Interviews</h1>
        <p className="mt-5 text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
          We are a platform that connects experienced tech professionals with companies seeking fair, high-quality technical evaluations for their candidates.
        </p>
      </div>
    </section>

    {/* Stats */}
    <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Our Story */}
    <section className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          NxtHire was born from a simple observation: companies struggle to find qualified technical interviewers, and experienced professionals want flexible ways to earn and contribute to the tech community.
        </p>
        <p>
          We built a platform that solves both problems. Our network of vetted industry experts conducts structured, domain-specific interviews, ensuring candidates receive fair and thorough evaluations while interviewers enjoy flexible schedules and competitive compensation.
        </p>
        <p>
          Today, our community spans multiple technology domains — from full-stack development to data science, cloud computing, and beyond. Every interview conducted through our platform upholds the highest standards of technical rigor and fairness.
        </p>
      </div>
    </section>

    {/* Values */}
    <section className="bg-gray-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map(v => (
            <div key={v.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <v.icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Join Our Interviewer Community</h2>
      <p className="text-gray-500 mb-6">Apply today and start conducting interviews on your own schedule.</p>
      <Button asChild size="lg" className="rounded-xl px-8">
        <Link to="/applicationform">Apply Now <ArrowRight size={16} className="ml-2" /></Link>
      </Button>
    </section>
  </div>
);

export default AboutPage;
