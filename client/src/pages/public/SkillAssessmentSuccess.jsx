import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const ACCENT = '#C0392B';
const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };

const SkillAssessmentSuccess = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border border-border bg-white text-foreground mx-auto">
            <CheckCircle className="h-6 w-6" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 mt-6 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            Received
          </span>

          <h1 style={DISPLAY} className="mt-5 text-[32px] font-semibold text-foreground tracking-tight leading-tight">
            Thank you.
          </h1>

          <div className="mt-6 space-y-4 text-left">
            <div className="rounded-2xl bg-muted/40 border border-border p-4">
              <p className="text-foreground/90 text-[13.5px] leading-relaxed">
                Thank you for completing the registration form and expressing your interest in becoming an
                <span className="font-semibold text-foreground mx-1">interviewer with NxtWave</span>.
                Your expertise is valuable to us.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 border border-border p-4">
              <p className="text-foreground/90 text-[13.5px] leading-relaxed">
                Our team will review your complete profile and get back to you with the next steps. Please keep an eye on your email.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link to="/" className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-primary text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessmentSuccess;
