import React, { useState, useEffect, useRef } from 'react';
import {
  Users, LayoutDashboard, UserCheck, BookOpen, DollarSign, Settings, Mail,
  PenSquare, Briefcase, FileText, UserPlus, GraduationCap, LifeBuoy, Accessibility,
  Shield, Calendar, Link as LinkIcon, CheckCircle, Clock, Sparkles, Globe, Info, Wrench, Package, ListTodo, Lock, AlertCircle
} from 'lucide-react';

// --- Local UI Helper Components ---
const InfoBox = ({ children, title, icon }) => (
    <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-blue-500">{icon}</div>
        <div className="ml-3">
          <h4 className="text-md font-bold text-blue-800">{title}</h4>
          <div className="mt-1 text-sm text-blue-700 space-y-2">{children}</div>
        </div>
      </div>
    </div>
);

const WarningBox = ({ children, title, icon }) => (
    <div className="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-yellow-500">{icon}</div>
        <div className="ml-3">
          <h4 className="text-md font-bold text-yellow-800">{title}</h4>
          <div className="mt-1 text-sm text-yellow-700 space-y-2">{children}</div>
        </div>
      </div>
    </div>
);

const Section = ({ id, title, icon, children }) => (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center mb-6 pb-2 border-b-2 border-blue-200">
        {icon && <span className="text-blue-600 mr-3">{icon}</span>}
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
);

const SubSection = ({ id, title, children }) => (
    <section id={id} className="mb-12 scroll-mt-24">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 pb-1 border-b border-gray-300">{title}</h3>
      <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
);
// --- END Local UI Helper Components ---

const DocsPage = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const observer = useRef(null);
    const sectionRefs = useRef({});

    // Define the documentation structure and content
    const documentationContent = {
        sections: [
            { id: 'introduction', title: 'Welcome to NxtHire', icon: <Sparkles />, level: 1, content: (
                <>
                    <p>NxtHire is a comprehensive, end-to-end platform designed to manage the recruitment, onboarding, scheduling, and payment workflow for freelance technical interviewers. This documentation will guide you through the features and functionalities available to you based on your role.</p>
                    <InfoBox title="What is NxtHire?" icon={<Info />}>
                        <p>NxtHire streamlines the entire process of engaging freelance technical interviewers, from their initial application to payment processing. It connects aspiring talent with industry experts, ensuring evaluations and a smooth operational workflow.</p>
                    </InfoBox>
                </>
            )},
            { id: 'user-roles', title: 'User Roles & Permissions', icon: <Users />, level: 1, content: (
                <>
                    <p>The NxtHire platform is designed with specific roles to ensure efficient and secure operations. Each role has distinct responsibilities and access levels:</p>
                    <ul>
                        <li><strong>Administrator:</strong> A superuser with full control over the system. Admins manage the hiring pipeline, onboard new interviewers, schedule interviews, manage payments, and configure system settings.</li>
                        <li><strong>Interviewer:</strong> A freelance professional who has been onboarded through the system. Interviewers can manage their profiles, set their availability, conduct interviews, and track their performance and earnings.</li>
                        <li><strong>Applicant (External):</strong> An individual in the process of applying to become an interviewer. They interact with public-facing forms and questionnaires without needing to log in.</li>
                        <li><strong>Student (External):</strong> An individual who needs to book a technical interview. They interact with a unique, public booking link provided by NxtWave, also without needing to log in.</li>
                    </ul>
                </>
            )},
            { id: 'public-journeys', title: 'Public-Facing Journeys', icon: <Globe />, level: 1, content: (
                <>
                    <p>These sections describe the experience for external users who interact with NxtHire without a login account: Applicants and Students.</p>
                    <SubSection id="applicant-journey" title="1. The Applicant Journey">
                        <p>This outlines the step-by-step process a potential interviewer goes through to join the NxtHire platform.</p>
                        <h4>1.1. Homepage & Initial Application</h4>
                        <p>Potential interviewers start their journey by visiting the NxtHire homepage, which showcases the benefits of joining the interviewer community.</p>
                        <ol>
                            <li>The user clicks the "Apply Now" button, redirecting them to the dedicated <strong>Application Form Page</strong>.</li>
                            <li>They complete the form, providing their Full Name, Email, Phone Number, WhatsApp Number, and LinkedIn Profile URL.</li>
                            <li>Upon successful submission, they are directed to an <strong>Application Success Page</strong> which confirms receipt and explains the next steps.</li>
                        </ol>
                        <InfoBox title="System Behavior" icon={<Info />}>
                            <p>An email confirmation is sent to the applicant with their unique Application ID. This ID is crucial for tracking their progress.</p>
                            <p>The applicant's status is set to <strong>"Application Submitted"</strong>.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763402013/Screenshot_2025-11-17_230902_mpllcj.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580703/Screenshot_2025-11-20_010049_avdhan.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580720/Screenshot_2025-11-20_010151_hh0k0t.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>1.2. Skills Assessment</h4>
                        <p>This stage is designed to capture detailed information about the applicant's technical proficiency.</p>
                        <ol>
                            <li>After an Admin approves their initial LinkedIn profile, the applicant receives an email with a unique, time-sensitive link to the <strong>Skill Assessment Page</strong>.</li>
                            <li>On this page, they provide details about their current employer, job title, total years of experience, and select specific technologies and sub-skills from an organized, accordion-style list. They can also list "Other Skills".</li>
                            <li>Upon submission, they are directed to a <strong>Skill Assessment Success Page</strong>.</li>
                        </ol>
                        <InfoBox title="System Behavior" icon={<Info />}>
                            <p>The system automatically suggests a primary technical domain (e.g., MERN, JAVA) based on their declared skills.</p>
                            <p>The applicant's status is updated to <strong>"Skills Assessment Completed"</strong>.</p>
                        </InfoBox>
                        <WarningBox title="Important Validation" icon={<AlertCircle />}>
                            <p>Applicants must select at least one technical skill or provide details in the "Other Skills" section to submit the form.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580930/Screenshot_2025-11-20_010417_leugxk.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580931/Screenshot_2025-11-20_010430_uqmwik.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580929/Screenshot_2025-11-20_010453_b932qh.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763581224/Screenshot_2025-11-20_010805_xvpymj.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>1.3. Guidelines Questionnaire</h4>
                        <p>This step ensures that all new interviewers understand NxtWave's standards and best practices for conducting interviews.</p>
                        <ol>
                            <li>After an Admin reviews and categorizes their skills, the applicant receives another email with a link to the <strong>Guidelines Page</strong>. This link also includes access to a comprehensive guidelines document.</li>
                            <li>The applicant must read the guidelines document thoroughly.</li>
                            <li>They then proceed to a timed, multiple-choice questionnaire (17 questions, 30-minute limit).</li>
                            <li>Upon submission, they see a <strong>Guidelines Submission Success Page</strong> confirming their submission is under final review.</li>
                        </ol>
                        <InfoBox title="System Behavior" icon={<Info />}>
                            <p>The questionnaire is automatically scored. A minimum score of 80% is required to "pass".</p>
                            <p>The applicant's status is updated to <strong>"Guidelines Reviewed"</strong>, awaiting a final decision from an Admin.</p>
                        </InfoBox>
                        <WarningBox title="Critical Requirement" icon={<AlertCircle />}>
                            <p>The questionnaire is timed. If the time limit is exceeded or not all questions are answered, the submission will be incomplete.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763581223/Screenshot_2025-11-20_010928_ywsuk2.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763581223/Screenshot_2025-11-20_010942_dj4zgs.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                        <h4>1.4. Account Creation (for Onboarded Interviewers)</h4>
                        <p>This is the final step for successful applicants to gain access to their Interviewer Portal.</p>
                        <ol>
                            <li>Upon final approval from an Admin (after passing the guidelines review), the new interviewer receives an email with a unique, time-sensitive link to the <strong>Create Password Page</strong>.</li>
                            <li>Here, they set a secure password for their new NxtHire account.</li>
                            <li>After setting their password, they are redirected to the <strong>Login Page</strong>.</li>
                        </ol>
                        <InfoBox title="System Behavior" icon={<Info />}>
                            <p>The password creation link is a one-time use token and typically expires within 24 hours for security.</p>
                            <p>Upon successful password creation, the interviewer's status is set to <strong>"Onboarded"</strong> (and subsequently, usually <strong>"On Probation"</strong>).</p>
                        </InfoBox>
                    </SubSection>

                    <SubSection id="student-journey" title="2. The Student Interview Booking Journey">
                        <p>This describes how external students book an interview slot provided by NxtWave.</p>
                        <h4>2.1. Email Verification</h4>
                        <p>This initial step ensures that only pre-authorized students can book an interview.</p>
                        <ol>
                            <li>The student receives a unique, public booking URL (e.g., <code>https://yourdomain.com/book/uniqueId123</code>) via email or other communication channels from NxtWave.</li>
                            <li>Upon visiting the URL, they are prompted to enter and verify their email address.</li>
                        </ol>
                        <InfoBox title="System Behavior" icon={<Info />}>
                            <p>The system checks if the entered email is on the whitelist of "Allowed Students" for that specific public booking link, which is configured by an Admin.</p>
                            <p>If the email is verified, the system checks if the student has previously booked a slot for this link:</p>
                            <ul>
                                <li><strong>If already booked:</strong> The student sees a confirmation that they already have a booking, displaying their existing details.</li>
                                <li><strong>If not yet booked:</strong> The student proceeds to the "Slot Selection" step.</li>
                            </ul>
                        </InfoBox>
                        <WarningBox title="Access Denied" icon={<AlertCircle />}>
                            <p>If the email is not authorized for this specific link, the student will receive an error message and cannot proceed.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763557163/Screenshot_2025-11-19_181612_lpb18x.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>2.2. Slot Selection</h4>
                        <p>After successful email verification, students can select their preferred interview slot.</p>
                        <ol>
                            <li>The student provides their Full Name and Phone Number.</li>
                            <li>They are presented with a list of available interview slots, neatly grouped by date and interviewer.</li>
                            <li>The student reviews the options and selects a single time slot that works for them.</li>
                            <li>After selection, they click "Confirm My Booking".</li>
                        </ol>
                        <InfoBox title="Real-time Availability" icon={<Info />}>
                            <p>The displayed slots are live. If a slot is booked by another student, it will instantly become unavailable. The system performs an atomic check at the point of submission to prevent double-bookings.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763557344/Screenshot_2025-11-19_183154_j5rne0.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>2.3. Booking Confirmation</h4>
                        <p>Once a slot is successfully booked, the student receives immediate confirmation.</p>
                        <ol>
                            <li>The student is redirected to a <strong>Booking Confirmation Page</strong> displaying their booked interview details (date, time, interviewer, candidate name).</li>
                        </ol>
                        <InfoBox title="System Behavior" icon={<Info />}>
                            <p>An email is automatically sent to the student containing the interview's Google Meet link, date, time, and other relevant details.</p>
                            <p>The selected slot is marked as "booked" in the system, removing it from future availability for other students.</p>
                            <p>A new entry or an update to an existing entry is made in the Admin's Main Sheet, reflecting the scheduled interview.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763557343/Screenshot_2025-11-19_183214_c2fxov.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>2.4. Payment Confirmation / Payment Received Confirmation (for Interviewers)</h4>
                        <p>These are public-facing forms specifically for interviewers to confirm payment-related statuses, triggered by Admins.</p>
                        <p><strong>Payment Confirmation:</strong></p>
                        <ol>
                            <li>An interviewer receives a unique email link from an Admin to confirm the number of interviews completed and the total amount owed for a specific period.</li>
                            <li>On the form, they can select "Confirmed" or "Disputed" and add optional remarks.</li>
                            <li>Upon submission, their response is recorded in the Admin's system.</li>
                        </ol>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763558676/Screenshot_2025-11-19_185422_igcvfw.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763558698/Screenshot_2025-11-19_185450_eer6lr.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763558784/Screenshot_2025-11-19_185559_eegsrr.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                        <p><strong>Payment Received Confirmation:</strong></p>
                        <ol>
                            <li>After payment is disbursed, an interviewer receives another unique email link asking them to confirm if they have received the payment.</li>
                            <li>They select "Received" or "Not Received" and can add remarks.</li>
                            <li>Their response updates the payment record for the Admin.</li>
                        </ol>
                        <WarningBox title="One-Time Use Links" icon={<AlertCircle />}>
                            <p>These confirmation links are typically one-time use and expire after a set period to prevent multiple submissions or unauthorized access.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763559117/Screenshot_2025-11-19_185907_yhxs36.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763559704/Screenshot_2025-11-19_191136_jy4wmx.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>
                </>
            )},
            { id: 'for-admins', title: 'Administrator\'s Guide', icon: <Shield />, level: 1, content: (
                <>
                    <p>The Admin Portal is the central command center for the entire NxtHire ecosystem. It provides comprehensive tools to manage every aspect of the interviewer workflow, from hiring to payments.</p>
                    
                    <SubSection id="admin-dashboard" title="1. Dashboard">
                        <p>The Dashboard provides a high-level, at-a-glance overview of the system's key metrics and current operational status.</p>
                        <h4>Key UI Elements:</h4>
                        <ul>
                            <li><strong>Stat Cards:</strong> Display quick, actionable numbers such as:
                                <ul>
                                    <li><strong>Total Applicants:</strong> Overall count of individuals who have applied.</li>
                                    <li><strong>Pending Reviews:</strong> Sum of applicants awaiting review at various stages (LinkedIn, Skills, Guidelines).</li>
                                    <li><strong>Active Interviewers:</strong> Number of interviewers currently marked as 'Active'.</li>
                                    <li><strong>Total Earnings:</strong> Cumulative earnings disbursed across the platform (can be toggled for visibility for privacy).</li>
                                </ul>
                            </li>
                            <li><strong>Interview Analytics:</strong> A visual section featuring charts for:
                                <ul>
                                    <li><strong>Interview Trends:</strong> Bar charts showing scheduled, completed, in-progress, and cancelled interviews by daily, weekly, or monthly views.</li>
                                    <li><strong>Recent Activity:</strong> A list of the most recent interviews with their candidate, date, and status.</li>
                                </ul>
                                <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763557866/Screenshot_2025-11-19_184058_ov09aq.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                            </li>
                            <li><strong>Probation Review Queue:</strong> A dedicated section that highlights interviewers who are on probation and have completed 5 or more interviews, indicating they might be eligible to move to 'Active' status.
                                <ul>
                                    <li><strong>Action:</strong> Admins can click to send a "Probation Completion Email" or manually "Mark as Sent".</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="System Behavior" icon={<Info />}>
                            <p>The "Pending Reviews" count updates in real-time as applicants move through the pipeline.</p>
                            <p>The Probation Review Queue helps identify interviewers requiring administrative action to update their status.</p>
                        </InfoBox>
                    </SubSection>

                    <SubSection id="admin-hiring" title="2. Hiring Workflow">
                        <p>This module provides a structured pipeline for managing the recruitment and onboarding of freelance interviewers.</p>
                        <h4>2.1. Applicants</h4>
                        <p>A comprehensive, searchable, and filterable master list of every individual who has ever applied to be an interviewer. This is your central record for all applicants.</p>
                        <ul>
                            <li><strong>Filters & Search:</strong> Search by name/email, filter by application status (e.g., "Application Submitted", "Profile Approved"), filter by domain.</li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>View Details:</strong> Click on an applicant's name to see their full profile, skill assessment, and status history.</li>
                                    <li><strong>Edit/Delete:</strong> Modify applicant details or remove their record.</li>
                                    <li><strong>Export:</strong> Download applicant data to an Excel file (CSV/XLSX).</li>
                                    <li><strong>Add:</strong> Manually add a new applicant into the system.</li>
                                </ul>
                            </li>
                        </ul>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763558269/Screenshot_2025-11-19_184737_l3cb5t.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>2.2. LinkedIn Review</h4>
                        <p>This is the first stage for new applicants. You review their LinkedIn profiles for initial suitability.</p>
                        <ol>
                            <li>Applicants whose status is <strong>"Application Submitted"</strong> or <strong>"Under Review"</strong> appear in this queue.</li>
                            <li><strong>Flow:</strong> Click on an applicant to view their basic details and LinkedIn profile link.</li>
                            <li><strong>Decision:</strong>
                                <ul>
                                    <li><strong>Approve:</strong> If suitable, approve their profile. They move to the next stage.</li>
                                    <li><strong>Reject:</strong> If not suitable, reject their profile, providing a mandatory reason.</li>
                                </ul>
                            </li>
                        </ol>
                        <InfoBox title="System Automation" icon={<Info />}>
                            <p><strong>Upon Approval:</strong> Applicant's status changes to <strong>"Profile Approved"</strong>, and an email is automatically sent inviting them to complete the <strong>"Skills Assessment"</strong>. Their status then immediately moves to <strong>"Skills Assessment Sent"</strong>.</p>
                            <p><strong>Upon Rejection:</strong> Applicant's status changes to <strong>"Profile Rejected"</strong>, and an email is automatically sent informing them of the rejection with the provided reason.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763558404/Screenshot_2025-11-19_184920_gxjpjo.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>2.3. Skill Categorization</h4>
                        <p>This stage focuses on validating and formalizing the technical domains of applicants who have completed their skills assessment.</p>
                        <ol>
                            <li>Applicants with status <strong>"Skills Assessment Completed"</strong> appear here.</li>
                            <li><strong>Flow:</strong> Review the applicant's self-reported technical skills (including an auto-suggested domain).</li>
                            <li><strong>Action:</strong> Assign one or more final, official technical domains (e.g., MERN, JAVA) to the applicant. You can also add internal review notes.</li>
                            <li><strong>Confirm & Send Guidelines:</strong> Finalize the categorization and move the applicant to the next stage.</li>
                        </ol>
                        <InfoBox title="System Automation" icon={<Info />}>
                            <p>Upon "Confirm & Send Guidelines", the applicant's status changes to <strong>"Guidelines Sent"</strong>. An email is automatically triggered inviting them to complete the <strong>"Guidelines Questionnaire"</strong>.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763558405/Screenshot_2025-11-19_184935_st9fhq.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>2.4. Guidelines Review</h4>
                        <p>The final step in the hiring funnel, where you assess the applicant's understanding of NxtWave's interviewing standards.</p>
                        <ol>
                            <li>Applicants with status <strong>"Guidelines Reviewed"</strong> appear here.</li>
                            <li><strong>Flow:</strong> View the applicant's score on the guidelines questionnaire and a breakdown of their answers (correct/incorrect).</li>
                            <li><strong>Decision:</strong>
                                <ul>
                                    <li><strong>Approve & Onboard:</strong> If the applicant has passed the assessment (typically ≥80%) and is deemed suitable. This is the final approval.</li>
                                    <li><strong>Reject:</strong> If the applicant did not pass or is otherwise unsuitable.</li>
                                </ul>
                            </li>
                        </ol>
                        <InfoBox title="System Automation" icon={<Info />}>
                            <p><strong>Upon "Approve & Onboard":</strong></p>
                            <ul>
                                <li>A new <strong>User account</strong> (role: 'interviewer') and <strong>Interviewer profile</strong> are automatically created for the applicant.</li>
                                <li>The applicant's status updates to <strong>"Onboarded"</strong> and then typically to <strong>"On Probation"</strong> for the interviewer profile.</li>
                                <li>An <strong>Account Creation Email</strong> is sent to the new interviewer with a secure link to set their password for the Interviewer Portal.</li>
                            </ul>
                            <p><strong>Upon Rejection:</strong> The applicant's status is updated to <strong>"Guidelines Failed"</strong>.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763558403/Screenshot_2025-11-19_184948_tc0hpy.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>

                    <SubSection id="admin-scheduling" title="3. Bookings & Scheduling">
                        <p>This module provides comprehensive tools for managing the entire interview scheduling process, from creating requests for interviewer availability to facilitating student bookings.</p>
                        <h4>3.1. Interviewer Booking Requests</h4>
                        <p>Here you can create and manage requests for interviewer availability for specific dates.</p>
                        <ul>
                            <li><strong>Create New Request:</strong> Specify a date and select one or more interviewers who should provide their availability.</li>
                            <li><strong>Track Responses:</strong> See the status of each interviewer's response for a given booking request (Pending, Submitted Slots, Not Available).</li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Edit Request:</strong> Modify the date or change the assigned interviewers.</li>
                                    <li><strong>Delete Request:</strong> Remove an entire booking request.</li>
                                    <li><strong>Close/Reopen Request:</strong> Control whether interviewers can still respond to a request.</li>
                                    <li><strong>Reset Submission:</strong> For a specific interviewer, reset their submitted slots/status back to "Pending".</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="System Automation" icon={<Info />}>
                            <p>When a new request is created, an email notification is sent to each selected interviewer, directing them to their portal to provide availability.</p>
                        </InfoBox>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763567131/Screenshot_2025-11-19_211515_zemvuo.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763567131/Screenshot_2025-11-19_211410_jngbma.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                        <h4>3.2. Booking Slots (Slot Aggregation)</h4>
                        <p>This page consolidates all available time slots submitted by interviewers, making it easy to create public booking links for students.</p>
                        <ol>
                            <li>View all submitted time slots, grouped by date and interviewer.</li>
                            <li><strong>Filter & Search:</strong> Easily find slots by date, interviewer name, or email.</li>
                            <li><strong>Select Slots:</strong> You can select individual slots or all slots for a particular interviewer for a given date.</li>
                            <li><strong>Create Public Link:</strong> After selecting desired slots, click "Create Public Link". This generates a unique, shareable URL for students.</li>
                        </ol>
                        <WarningBox title="Creating Public Links" icon={<AlertCircle />}>
                            <p>Only "Submitted" slots (i.e., those provided by interviewers) are available for selection here.</p>
                            <p>Once a public link is created, the selected slots are reserved and cannot be part of another public link unless they are unselected from the current link (currently not supported). </p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763578754/Screenshot_2025-11-20_002411_ow2adf.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>3.3. Manage Public Links (Student Bookings)</h4>
                        <p>An overview of all public booking links you've created, with tools to manage student access and invitations.</p>
                        <ul>
                            <li><strong>Link Details:</strong> View the unique <code>Public ID</code>, creation date, and who created it.</li>
                            <li><strong>Assigned Interviewers:</strong> See how many interviewers contributed slots to the link and their names (via hover).</li>
                            <li><strong>Student Counts:</strong> Track the total number of authorized students and how many have booked vs. are pending.</li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Track:</strong> Go to the Email Tracking Page for this specific link to see individual student statuses.</li>
                                    <li><strong>Authorize Students:</strong> Upload a CSV/XLSX file containing a list of student emails and other details (name, domain, etc.) who are permitted to use this link. The system will then automatically send email invitations.</li>
                                    <li><strong>Delete Link:</strong> Permanently remove a public booking link and all associated student invitations and bookings.</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="System Automation" icon={<Info />}>
                            <p>When students are authorized via upload, NxtHire automatically pre-creates corresponding entries in the Main Sheet for future tracking, linking them to a unique <code>Interview ID</code>.</p>
                            <p>An email invitation is sent to each authorized student with their unique booking link.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763578741/Screenshot_2025-11-20_002424_vf71tp.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763578739/Screenshot_2025-11-20_002605_ojugcn.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>3.4. Confirmed Slots</h4>
                        <p>This is your pipeline for all interviews that students have either booked or are still pending booking. It's the central hub for preparing and initiating scheduled interviews.</p>
                        <ul>
                            <li><strong>Tabs:</strong>
                                <ul>
                                    <li><strong>Confirmed Bookings:</strong> Displays all student bookings where a slot has been successfully reserved.</li>
                                    <li><strong>Pending Invitations:</strong> Lists students who have been invited but have not yet booked a slot. You can manually book slots for them here.</li>
                                </ul>
                            </li>
                            <li><strong>Inline Editing (Confirmed & Pending):</strong> Directly edit fields like 'Domain', 'Host Email', and 'Event Title' in the table. Changes are saved automatically.
                                <ul>
                                    <li><strong>Host Email:</strong> Crucial for Google Meet generation. You can type a new email or select from previous hosts.</li>
                                    <li><strong>Event Title:</strong> The title that will appear in the Google Calendar event. Defaults to a combination of Domain and Candidate Name.</li>
                                </ul>
                            </li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Generate Google Meet Link (Confirmed):</strong> Click to automatically create a Google Meet link and update the booking record. Requires Student, Interviewer, and Host emails, along with an Event Title.</li>
                                    <li><strong>Manual Booking (Pending):</strong> For pending students, select an available date/time/interviewer combination and manually book a slot. This effectively moves them to 'Confirmed Bookings'.</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="System Automation" icon={<Info />}>
                            <p>Generating a Google Meet link also updates the corresponding entry in the Main Sheet.</p>
                            <p>Manual booking creates a new <code>StudentBooking</code> record, reserves the slot, and updates the <code>MainSheetEntry</code>.</p>
                        </InfoBox>
                        <WarningBox title="Meet Link Generation" icon={<AlertCircle />}>
                            <p>To successfully generate a Google Meet link, ensure that the <strong>Student Email</strong>, <strong>Interviewer Email</strong>, and <strong>Host Email</strong> fields are populated, along with the <strong>Event Title</strong>.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763578712/Screenshot_2025-11-20_002629_jgvezb.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763578711/Screenshot_2025-11-20_002646_kv6dfa.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>

                    <SubSection id="admin-data" title="4. Core Data Management">
                        <p>This section allows for direct manipulation and oversight of critical system data.</p>
                        <h4>4.1. Main Sheet</h4>
                        <p>The Master Data Sheet is the central repository for all interview entries, offering detailed information and granular control over each interview record.</p>
                        <ul>
                            <li><strong>Columns:</strong> Includes fields for Candidate Name, Interview ID, Mail ID, Resume Link, Meeting Link, Recording Link, Interview Date, Time, Duration, Status, Remarks (Admin), Interviewer Remarks (Interviewer), Interviewer Name, Tech Stack, Hiring Name, etc.</li>
                            <li><strong>Inline Editing:</strong> Most fields within the table are directly editable. Changes are saved automatically upon blur.</li>
                            <li><strong>Filters & Search:</strong> Search by various text fields or filter by Interview Date/Status.</li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Add Entries:</strong> Manually create new interview entries.</li>
                                    <li><strong>Bulk Upload:</strong> Import multiple entries from a CSV/XLSX file.</li>
                                    <li><strong>Bulk Delete:</strong> Delete multiple selected entries.</li>
                                    <li><strong>Export:</strong> Download the current view of the main sheet to an Excel file.</li>
                                    <li><strong>Reload Button:</strong> Refreshes 'Recording Link' and 'Transcript Link' fields by checking Google Calendar events.</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="Interview Status Lifecycle" icon={<Info />}>
                            <p>Interview status typically progresses:</p>
                            <ol>
                                <li><strong>Pending Student Booking:</strong> Entry exists, but no student has booked a slot yet.</li>
                                <li><strong>Scheduled:</strong> A student has successfully booked a slot.</li>
                                <li><strong>InProgress:</strong> The interview is currently happening (manually set).</li>
                                <li><strong>Completed:</strong> The interview has concluded.</li>
                                <li><strong>Cancelled:</strong> The interview was cancelled (can be by student, interviewer, or admin).</li>
                            </ol>
                            <p>Admins can manually change statuses as needed. Changing status to "Cancelled" will trigger emails to both student and interviewer if their emails are available.</p>
                        </InfoBox>
                        <WarningBox title="Reload Recording Links" icon={<AlertCircle />}>
                            <p>The "Reload" button for recording/transcript links checks recent Google Calendar events for attachments. It will <strong>overwrite existing empty fields</strong> but typically won't overwrite already populated links unless Google API indicates a new or updated attachment for that specific meeting link.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579119/Screenshot_2025-11-20_003205_opuq2z.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>4.2. Interviewer Management</h4>
                        <p>A central place to manage all onboarded interviewers, their profiles, and statuses.</p>
                        <ul>
                            <li><strong>Profile Details:</strong> View and edit personal details, professional experience, assigned domains, and payment tiers.</li>
                            <li><strong>Status Management:</strong> Update an interviewer's status (e.g., On Probation, Active, Inactive, Suspended, Terminated).</li>
                            <li><strong>Editable IDs:</strong> Directly edit <code>Interviewer ID</code> and <code>Payout ID</code> within the table.</li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Send Welcome Email:</strong> Manually trigger the account creation/welcome email to an interviewer if they haven't received it or need a new password setup link.</li>
                                    <li><strong>Send Probation Email:</strong> Manually send the "Probation Completion" email to interviewers who meet performance criteria.</li>
                                    <li><strong>Mark Probation Sent:</strong> Manually mark a probation email as sent without sending an actual email.</li>
                                    <li><strong>Bulk Upload/Delete:</strong> Efficiently add or remove multiple interviewer records via CSV/XLSX.</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="Probation to Active Transition" icon={<Info />}>
                            <p>The system flags interviewers on probation who have completed 5+ interviews in the dashboard. An admin must then manually send the "Probation Completion" email and/or update their status to "Active".</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579117/Screenshot_2025-11-20_003253_hfyplq.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>4.3. User Management</h4>
                        <p>Manage access and details for all user accounts (Admins and Interviewers) within the NxtHire platform.</p>
                        <ul>
                            <li><strong>User Details:</strong> View and edit basic user information (first name, last name, email, phone, role).</li>
                            <li><strong>Account Status:</strong> Toggle a user's <code>isActive</code> status to enable or disable their access to the portal.</li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Add New User:</strong> Create a new user account (e.g., for a new Admin).</li>
                                    <li><strong>Delete User:</strong> Permanently delete a user account. This action is irreversible and will also delete their associated Interviewer profile if applicable.</li>
                                </ul>
                            </li>
                        </ul>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579116/Screenshot_2025-11-20_003310_xz9usm.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>
                    
                    <SubSection id="admin-finance" title="5. System & Finance">
                        <p>This module provides tools for configuring evaluation criteria and managing all financial aspects of interviewer payments.</p>
                        <h4>5.1. Evaluation Setup</h4>
                        <p>Configure the technical domains and define the structure of evaluation sheets used for interviews.</p>
                        <ul>
                            <li><strong>Domains Tab:</strong>
                                <ul>
                                    <li><strong>Create/Edit/Delete Domains:</strong> Manage the list of technical domains (e.g., MERN, JAVA) used throughout the system.</li>
                                    <li><strong>Interview Help Document:</strong> Add a link to a help document specific to each domain, accessible by interviewers.</li>
                                </ul>
                            </li>
                            <li><strong>Domain Fields Tab:</strong>
                                <ul>
                                    <li>Select a Domain to define its evaluation structure.</li>
                                    <li><strong>Create Categories:</strong> Organize evaluation criteria into logical groups (e.g., "Technical Skills", "Problem Solving").</li>
                                    <li><strong>Add Parameters:</strong> Within each category, add specific evaluation parameters (e.g., "Data Structures", "Communication"). Parameters can be <code>Select/Dropdown</code> (with predefined options/values for scoring) or <code>Text</code> fields (for free-form remarks).</li>
                                    <li><strong>Manage Options (for Select fields):</strong> Easily add, edit, delete, or bulk-paste options (labels and values) for dropdown parameters.</li>
                                    <li><strong>Import Feature:</strong> Import categories/parameters/options from other existing domains to speed up setup.</li>
                                    <li><strong>Preview Mode:</strong> See how the evaluation sheet will appear to an interviewer.</li>
                                </ul>
                            </li>
                        </ul>
                        <WarningBox title="Domain Deletion" icon={<AlertCircle />}>
                            <p>Deleting a domain will also permanently delete its associated evaluation sheet configuration. This action cannot be undone.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579116/Screenshot_2025-11-20_003342_twirib.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>5.2. Domain Evaluation</h4>
                        <p>A powerful data review tool allowing you to analyze historical interviewer evaluation data in a structured, spreadsheet-like format.</p>
                        <ul>
                            <li><strong>Flow:</strong> Select a Domain from the dropdown. The table will populate with all completed interviews for that domain.</li>
                            <li><strong>Data Display:</strong> View all interview details alongside the corresponding evaluation scores/remarks provided by the interviewer.</li>
                            <li><strong>Toggle Labels/Values:</strong> Switch between viewing raw numerical scores (values) or their descriptive text (labels) for evaluation parameters.</li>
                            <li><strong>Filters & Search:</strong> Filter by interview date, status, or search by candidate/interviewer details.</li>
                            <li><strong>Export:</strong> Download the evaluation data (reflecting the current label/value display) to an Excel file.</li>
                        </ul>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579115/Screenshot_2025-11-20_003401_gjaxuw.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579115/Screenshot_2025-11-20_003451_ohkini.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>5.3. Earnings Report</h4>
                        <p>A multi-tab page for managing interviewer payments, generating reports, and tracking payment statuses.</p>
                        <ul>
                            <li><strong>Reports Tab:</strong> Provides a high-level yearly and monthly summary of total payments made across all interviewers. Click on a month to drill down into individual interviewer payments for that month.</li>
                            <li><strong>Payment Requests Tab:</strong>
                                <ul>
                                    <li><strong>Generate Requests:</strong> Select a date range to generate a list of interviewers eligible for payment based on their completed interviews.</li>
                                    <li><strong>Bonus Logic:</strong> Add a bonus amount to an interviewer's payment for a specific period. This updates their total payable amount.</li>
                                    <li><strong>Send Payment Email:</strong> Trigger an email to the interviewer, asking them to confirm the calculated interview count and total amount. Includes a confirmation link.</li>
                                    <li><strong>Send Invoice Email:</strong> Trigger an email to the interviewer with details for them to redeem their payment.</li>
                                    <li><strong>Send Payment Received Email:</strong> Send a final email to the interviewer asking them to confirm that they have actually received their payment.</li>
                                </ul>
                            </li>
                            <li><strong>Payout Sheet Tab:</strong> Generates a formatted sheet that is ready for the finance team to process payouts, including columns like <code>user_id</code>, <code>points</code>, <code>activity_name_enum</code>, etc.</li>
                        </ul>
                        <InfoBox title="Payment Flow" icon={<Info />}>
                            <p>1. Admin generates requests and sends <strong>Payment Confirmation</strong> email.</p>
                            <p>2. Interviewer confirms payment details via a public link.</p>
                            <p>3. Admin can then send <strong>Invoice Mail</strong> for redemption.</p>
                            <p>4. After payment is disbursed, Admin sends <strong>Payment Received Confirmation</strong> email to interviewer.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579494/Screenshot_2025-11-20_004022_uifice.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579491/Screenshot_2025-11-20_004031_phx6vg.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>

                    <SubSection id="admin-comms" title="6. Communication Center">
                        <p>This module provides tools for creating, managing, and sending custom email communications.</p>
                        <h4>6.1. Custom Email</h4>
                        <ul>
                            <li><strong>Tabs:</strong>
                                <ul>
                                    <li><strong>Send Emails:</strong> Select an existing template, upload a CSV/XLSX list of recipients (must contain an "Email" column), and send bulk emails. A live preview shows how the email will look with data from the first row of your uploaded file.</li>
                                    <li><strong>Create/Edit Templates:</strong> Use a rich text editor to design HTML email templates. You can insert dynamic placeholders (e.g., <code>{"{{FullName}}"}</code>, <code>{"{{Report Link}}"}</code>) which will be replaced with actual data from your recipient CSV.</li>
                                </ul>
                            </li>
                        </ul>
                        <WarningBox title="Placeholders & CSV Headers" icon={<AlertCircle />}>
                            <p>Ensure that the column headers in your uploaded CSV/XLSX file exactly match the placeholders you use in your email template (e.g., if template has <code>{"{{CandidateName}}"}</code>, your CSV needs a column named "CandidateName"). An "Email" column is always required.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579491/Screenshot_2025-11-20_004105_fu9j5q.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579490/Screenshot_2025-11-20_004118_yvng0x.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>
                </>
            )},
            { id: 'for-interviewers', title: 'Interviewer\'s Guide', icon: <UserCheck />, level: 1, content: (
                <>
                    <p>Welcome to your personalized NxtHire Interviewer Portal! This guide helps you manage your profile, availability, assigned interviews, and track your performance and earnings.</p>
                    <SubSection id="interviewer-dashboard" title="1. Dashboard">
                        <p>Your dashboard provides a quick, consolidated summary of your activities and upcoming tasks.</p>
                        <ul>
                            <li><strong>Stat Cards:</strong> At-a-glance numbers for:
                                <ul>
                                    <li><strong>Interviews Scheduled:</strong> Your upcoming interviews.</li>
                                    <li><strong>Interviews Completed:</strong> Successfully finished interviews.</li>
                                    <li><strong>Interviews Cancelled:</strong> Interviews that were cancelled.</li>
                                    <li><strong>Total Earnings:</strong> Your cumulative earnings (link to Payment History).</li>
                                </ul>
                            </li>
                            <li><strong>Upcoming Interviews:</strong> A list of your next few scheduled interviews, showing the candidate, date, time, and status.</li>
                        </ul>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579965/Screenshot_2025-11-20_004336_crhwhi.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>

                    <SubSection id="interviewer-profile" title="2. My Profile">
                        <p>This is your central hub for managing all your personal, professional, and financial information.</p>
                        <ul>
                            <li><strong>Profile Details Tab:</strong>
                                <ul>
                                    <li>Update your first name, last name, phone number, WhatsApp number, current employer, job title, years of experience, and company type.</li>
                                    <li>Your email and assigned domains are displayed and managed by Admin.</li>
                                </ul>
                            </li>
                            <li><strong>Experience Tab:</strong> Add, edit, or remove your past work experiences, including job title, company, dates, and associated skills.</li>
                            <li><strong>Skills Tab:</strong> List your technical skills and proficiency levels (Beginner, Intermediate, Advanced, Expert).</li>
                            <li><strong>Bank Information Tab:</strong> Securely enter and update your bank account details for payment processing (Account Holder Name, Account Number, Bank Name, IFSC Code).</li>
                            <li><strong>Security Tab:</strong> Change your account password.</li>
                        </ul>
                        <WarningBox title="Profile Completeness" icon={<AlertCircle />}>
                            <p>Keeping your profile fully updated (especially bank details and skills) is crucial for receiving interview assignments and timely payments. Your profile completeness percentage is visible on your dashboard.</p>
                        </WarningBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579964/Screenshot_2025-11-20_004354_pc93ds.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>

                    <SubSection id="interviewer-availability" title="3. Availability">
                        <p>This page lists all requests for your availability that the Admin has sent for specific dates. You must respond to these requests.</p>
                        <ul>
                            <li><strong>Request List:</strong> Each entry shows the date for which your availability is requested.</li>
                            <li><strong>Status:</strong> Indicates your response status for that request:
                                <ul>
                                    <li><strong>Awaiting Availability:</strong> You haven't responded yet.</li>
                                    <li><strong>Slots Submitted:</strong> You have provided your available time slots.</li>
                                    <li><strong>Not Available:</strong> You have explicitly declined the request.</li>
                                    <li><strong>Request Closed:</strong> The Admin has closed the request, and you can no longer respond.</li>
                                </ul>
                            </li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Provide Availability:</strong> Click this button to open a form where you can submit one or more time slots during which you are free on the requested date. You can also add remarks.</li>
                                    <li><strong>Not Interested:</strong> Click this to decline the request if you are completely unavailable for the date, providing a brief reason.</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="Timely Responses" icon={<Info />}>
                            <p>Responding promptly to availability requests helps the Admin schedule interviews efficiently and ensures you get assigned available slots.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579962/Screenshot_2025-11-20_004414_rc4qx6.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579961/Screenshot_2025-11-20_004454_c1zb8n.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579960/Screenshot_2025-11-20_004509_la4prc.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>

                    <SubSection id="interviewer-evaluation" title="4. Scheduled Interviews">
                        <p>This page provides a calendar-style view of all your assigned interviews, allowing you to track and manage their status.</p>
                        <ul>
                            <li><strong>Calendar View:</strong> See your interviews displayed on a weekly calendar, color-coded by their status.</li>
                            <li><strong>Interview Details:</strong> Click on any interview event to open a modal displaying:
                                <ul>
                                    <li>Candidate name, assigned domain, time, meeting link.</li>
                                    <li>An option to update the interview's status.</li>
                                </ul>
                            </li>
                            <li><strong>Actions:</strong>
                                <ul>
                                    <li><strong>Update Status:</strong> Change the interview status (e.g., from "Scheduled" to "Completed", "InProgress", or "Cancelled"). This is crucial for tracking and payment.</li>
                                    <li><strong>Join Meeting:</strong> Directly access the Google Meet link.</li>
                                </ul>
                            </li>
                        </ul>
                        <InfoBox title="Post-Interview Action" icon={<Info />}>
                            <p>After completing an interview, it is critical to update its status to "Completed" for accurate tracking and to ensure your earnings are calculated correctly.</p>
                        </InfoBox>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579958/Screenshot_2025-11-20_004536_mp3srb.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>

                    <SubSection id="interviewer-performance" title="5. Domain Evaluation & Payment History">
                        <p>This section allows you to review your own performance data and track your earnings.</p>
                        <h4>5.1. Domain Evaluation</h4>
                        <p>This feature allows you to review your own past evaluation data for interviews you've conducted.</p>
                        <ul>
                            <li><strong>Flow:</strong> Select one of your assigned domains from the dropdown.</li>
                            <li><strong>Data View:</strong> A table displays all your past evaluations for that domain, showing the candidate, interview details, and the scores/remarks you provided for each parameter.</li>
                            <li><strong>Purpose:</strong> Use this to analyze your consistency in evaluations, identify areas of focus, and ensure accurate record-keeping of your contributions.</li>
                        </ul>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579957/Screenshot_2025-11-20_004557_hgdtpu.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579954/Screenshot_2025-11-20_004650_ppxj1w.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579953/Screenshot_2025-11-20_004701_efpgzi.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>

                        <h4>5.2. Payment History</h4>
                        <p>A transparent record of all your past earnings from completed interviews.</p>
                        <ul>
                            <li><strong>Flow:</strong> Select a predefined date range (e.g., "This Month", "Last 6 Months") or define a custom date range.</li>
                            <li><strong>Summary:</strong> View your total interviews completed and total amount earned for the selected period.</li>
                            <li><strong>Breakdown:</strong> See a detailed breakdown of your earnings by domain, including how many interviews you completed for each and the corresponding amount.</li>
                        </ul>
                        <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763579874/Screenshot_2025-11-20_004725_wktcls.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    </SubSection>
                </>
            )},
            { id: 'auth', title: 'Authentication', icon: <Lock />, level: 1, content: (
                <>
                    <p>The NxtHire platform provides secure authentication mechanisms for Admins and Interviewers.</p>
                    <h4>Login Page</h4>
                    <p>This is the standard entry point for all authenticated users to access their respective portals.</p>
                    <ul>
                        <li><strong>Fields:</strong> Email Address, Password.</li>
                        <li><strong>Features:</strong> "Remember me" option, "Forgot password?" link.</li>
                    </ul>
                    <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580267/Screenshot_2025-11-20_005315_opoidj.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                    <h4>Forgot/Reset Password</h4>
                    <p>A standard workflow for users who have forgotten their password.</p>
                    <ol>
                        <li>On the Login page, click "Forgot password?".</li>
                        <li>Enter your registered email address. A password reset link will be sent to your inbox.</li>
                        <li>Click the link in the email (valid for 10 minutes) to navigate to the <strong>Reset Password Page</strong>.</li>
                        <li>Set a new, secure password and confirm it.</li>
                    </ol>
                    <InfoBox title="Security Best Practices" icon={<Info />}>
                        <p>Always use strong, unique passwords. Avoid reusing passwords across different platforms.</p>
                    </InfoBox>
                    <iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580267/Screenshot_2025-11-20_005322_qujfcw.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580266/Screenshot_2025-11-20_005344_b8sdfd.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
<iframe
  width="900"
  height="500"
  style={{ border: 0 }}
  srcDoc={`
    <html>
      <body style='margin:0;padding:0;overflow:hidden;'>
        <img 
          src='https://res.cloudinary.com/dg8n2jeur/image/upload/v1763580265/Screenshot_2025-11-20_005352_fg4bqd.png'
          style='width:100%;height:100%;object-fit:cover;'
        />
      </body>
    </html>
  `}
/>
                </>
            )},
            { id: 'support', title: 'Troubleshooting & Support', icon: <LifeBuoy />, level: 1, content: (
                <>
                    <p>Encountering an issue? Here are some common solutions and how to get further assistance.</p>
                    <InfoBox title="Common Questions" icon={<UserPlus />}>
                        <p><strong>I can't log in. What should I do?</strong><br/>Use the "Forgot Password?" link on the login page to reset your password. Ensure you are using the email address you registered with.</p>
                        <p><strong>My confirmation link (e.g., for password setup) is expired.</strong><br/>Password reset and account creation links are time-sensitive for security. Please request a new "Forgot Password" link or contact an administrator.</p>
                        <p><strong>I submitted my availability, but it's not showing up.</strong><br/>Check your "Availability" page. If the request status is "Slots Submitted", it means the Admin has received it. If the request was "Closed" by the admin before you submitted, your submission might not have been recorded. Contact your Admin for clarification.</p>
                        <p><strong>The Google Meet link is missing from my interview.</strong><br/>Contact your Admin to have them generate or provide the Google Meet link for the scheduled interview.</p>
                        <p><strong>I need to change my bank details.</strong><br/>Navigate to "My Profile" and then the "Bank Information" tab to update your details. Ensure they are correct for timely payments.</p>
                    </InfoBox>
                    <p>For any technical issues or questions not covered here, please contact our support team at <a href="mailto:interviewercommunity@nxtwave.in" className="font-semibold text-blue-600">interviewercommunity@nxtwave.in</a>.</p>
                </>
            )}
        ],
    };

    // Slugify helper (remains the same)
    const slugify = (text) => {
        return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    };

    // Effect to observe sections and update activeSection
    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                let currentIntersectingId = null;
                // Find the topmost intersecting section that is more than 20% visible
                for (let i = 0; i < documentationContent.sections.length; i++) {
                    const section = documentationContent.sections[i];
                    const entry = entries.find(e => e.target.id === section.id);
                    if (entry && entry.isIntersecting && entry.intersectionRatio >= 0.2) {
                        currentIntersectingId = section.id;
                        break;
                    }
                }
                if (currentIntersectingId && currentIntersectingId !== activeSection) {
                    setActiveSection(currentIntersectingId);
                }
            },
            { rootMargin: '-20% 0px -80% 0px', threshold: 0.2 } // Adjusted threshold
        );

        const currentObserver = observer.current;
        documentationContent.sections.forEach((section) => {
            const el = document.getElementById(section.id);
            if (el) {
                sectionRefs.current[section.id] = el;
                currentObserver.observe(el);
            }
        });

        // Cleanup observer
        return () => {
            Object.values(sectionRefs.current).forEach((el) => {
                if (el) currentObserver.unobserve(el);
            });
        };
    }, [documentationContent.sections, activeSection]); // Re-run if sections change or activeSection changes

    return (
        <div className="bg-gray-50 font-sans">
            <style>{`html { scroll-behavior: smooth; }`}</style>
            <div className="container mx-auto flex flex-col lg:flex-row">
                {/* Sticky Sidebar */}
                <aside className="w-full lg:w-1/4 h-auto lg:h-screen lg:sticky top-0 bg-white border-r border-gray-200 p-6 lg:p-8 overflow-y-auto">
                    <h2 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-6">Contents</h2>
                    <nav>
                        <ul>
                            {documentationContent.sections.map((section) => (
                                <li key={section.id} className={`${section.level === 2 ? 'ml-4' : ''} ${section.level === 3 ? 'ml-8' : ''} mb-2`}>
                                    <a
                                        href={`#${section.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm py-1 rounded-md ${
                                            activeSection === section.id ? 'font-bold text-blue-600 bg-blue-50' : ''
                                        }`}
                                    >
                                        {section.icon && <span className="mr-2 opacity-80">{section.icon}</span>}
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="w-full lg:w-3/4 p-6 lg:p-12 bg-white">
                    {documentationContent.sections.map(section => (
                        <Section key={section.id} id={section.id} title={section.title} icon={section.icon}>
                            {section.content}
                        </Section>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default DocsPage;
