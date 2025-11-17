// client/src/pages/DocsPage.jsx
import React, { useEffect, useState } from 'react';

const documentationContent = `
## 1. Introduction
NxtHire is a comprehensive, end-to-end platform designed to manage the recruitment, onboarding, scheduling, and payment workflow for freelance technical interviewers. The system provides distinct portals for Administrators to manage the entire process and for Interviewers to manage their profiles, availability, and assigned interviews.
It also includes a public-facing side for Applicants to apply to the program and for external Students to book their scheduled interviews.

## 2. User Roles
The system is built around three primary user roles and one external role:
- **Administrator**: A superuser with full control over the system. Admins manage the hiring pipeline, onboard new interviewers, schedule interviews, manage payments, and configure system settings.
- **Interviewer**: A freelance professional who has been onboarded through the system. Interviewers can manage their profiles, set their availability, conduct interviews, and track their performance and earnings.
- **Applicant**: An individual in the process of applying to become an interviewer. They interact with a public-facing series of forms and questionnaires.
- **Student (External User)**: An individual who needs to book a technical interview. They interact with a unique, public booking link to select a time slot with an available interviewer.

## 3. The Public-Facing Experience (Applicant & Student Journey)
This section covers all features that are accessible to the public without needing to log in.

### 3.1. Homepage & Application
**Purpose**: To provide a landing page for potential interviewers to learn about the program and apply.
**User Flow**:
1. A user visits the homepage, which contains information about the benefits of becoming a NxtWave interviewer.
2. They click the "Apply Now" button, which takes them to the dedicated Application Form Page.
3. On this form, they fill out their basic information: Full Name, Email, Phone Number, and LinkedIn Profile URL.
4. Upon submission, they are redirected to an Application Success page, which confirms receipt of their application and outlines the next steps in the review process.

### 3.2. The Interviewer Hiring Funnel
This is a step-by-step process that a successful applicant follows after their initial application.
**Skills Assessment**:
- **Purpose**: For an approved applicant to provide detailed information about their professional experience and technical skills.
- **User Flow**: After an Admin approves their initial profile, the applicant receives an email with a unique link to the Skill Assessment Page. They provide details on their current role, years of experience, and select specific technologies they are proficient in from an organized list.
**Guidelines Questionnaire**:
- **Purpose**: To ensure the applicant understands NxtWave's interviewing standards and best practices.
- **User Flow**: After an Admin reviews and categorizes their skills, the applicant receives another email with a link to the Guidelines Page. They are required to answer a timed, multiple-choice questionnaire based on a provided guidelines document. Upon submission, they see a success page confirming their submission is under final review.
**Account Creation**:
- **Purpose**: To allow a successfully onboarded applicant to set their password and gain access to the Interviewer Portal.
- **User Flow**: Upon final approval from an Admin, the new interviewer receives a final email with a unique, time-sensitive link to the Create Password Page. Here, they can set a secure password for their new account, after which they are redirected to the Login page.

### 3.3. Student Interview Booking
**Purpose**: To allow an external student to book an interview slot with an available interviewer.
**User Flow**:
1. The student receives a unique, public URL (e.g., .../book/uniqueId123).
2. They first enter and verify their email address. The system checks if this email is authorized for this specific booking link.
3. If authorized, they are presented with a form to enter their name and phone number, alongside a list of available interview slots grouped by date and interviewer.
4. The student selects a single time slot and submits the form.
5. They are then shown a Confirmation Page, and an email is sent with the meeting link and details.

### 3.4. Authentication
- **Login Page**: A standard login page for Admins and Interviewers to access their respective portals using email and password.
- **Forgot/Reset Password**: A standard workflow where a user can enter their email to receive a password reset link.

## 4. The Admin Portal
The Admin Portal is the central hub for managing the entire NxtHire ecosystem.

### 4.1. Dashboard
**Purpose**: To provide a high-level, at-a-glance overview of the system's key metrics.
**Key Functionalities**:
- **Stat Cards**: Display key numbers like Total Applicants, Pending Reviews, Active Interviewers, and Total Earnings (with a visibility toggle for privacy).
- **Interview Analytics**: A visual dashboard with charts showing interview trends (daily, weekly, monthly) and recent activity.
- **Quick Lists**: Tables showing the most recent applicants and upcoming interviews for quick access.
- **Probation Review List**: A new feature that flags interviewers on probation who have completed 5+ interviews, prompting an admin review.

### 4.2. Hiring Workflow Module
This is a dedicated section for managing the applicant pipeline.
- **Applicants List**: A comprehensive, searchable, and filterable table of every individual who has ever applied.
- **LinkedIn Review Page**: A queue of new applicants pending their initial profile review. Admins can view the applicant's LinkedIn profile and either "Approve" or "Reject" them.
- **Skill Categorization Page**: A queue of applicants who have completed their skills assessment. Admins review the self-reported skills, see the system's auto-suggested domain, and assign the final, official domains to the applicant.
- **Guidelines Review Page**: A queue of applicants who have completed the guidelines questionnaire. Admins can view the score, see which questions were answered correctly/incorrectly, and make the final "Approve & Onboard" or "Reject" decision.

### 4.3. Bookings & Scheduling Module
This module handles all aspects of scheduling interviews.
- **Interviewer Bookings (Internal)**: Admins create availability requests for specific dates and send them to a selected group of interviewers. This page lists all historical and open requests.
- **Booking Slots (Slot Aggregation)**: This page provides a consolidated view of all time slots submitted by interviewers in response to the requests. Admins can select specific slots from various interviewers to be included in a public booking link.
- **Manage Public Links (Student Bookings)**: This page lists all the public booking links created by admins. From here, admins can:
  - View statistics on how many students have been invited vs. booked.
  - Authorize & Invite Students: Upload or paste a list of students who are permitted to use a specific link. The system then sends out email invitations.
  - Track the status of each student (Booked/Pending).
- **Confirmed Slots**: A pipeline view showing all booked interviews, both confirmed by students and those pending booking. This is the central hub for managing upcoming interviews and generating Google Meet links.

### 4.4. Core Data Management
- **Main Sheet**: The central database for all scheduled interviews. It's a comprehensive table with extensive details for each interview (candidate, interviewer, date/time, links, status, etc.). Admins can perform inline editing, bulk updates, and export the data.
- **Interviewer Management**: A filterable and sortable list of all onboarded interviewers. Admins can:
  - View and edit interviewer profiles.
  - Manually send Welcome or Probation Completion emails.
  - Bulk import/export interviewers.
  - Manage interviewer status (e.g., Active, On Probation).
- **User Management**: A separate list to manage system user accounts, specifically for creating and managing other Admin users.

### 4.5. System & Finance
- **Evaluation Setup**: A crucial configuration area where admins can:
  - Create, edit, and delete the Domains (e.g., MERN, JAVA) used throughout the system.
  - Define the structure of the Evaluation Sheet for each domain, including evaluation categories and specific parameters. Admins can also import parameters from other domains.
- **Domain Evaluation**: A powerful data review tool. Admins can select a domain and view all historical interview evaluation data in a spreadsheet-like format, with options to view raw scores or descriptive labels.
- **Earnings Report**: A multi-faceted page for managing payments.
  - **Reports View**: Provides a high-level yearly and monthly summary of total payments made.
  - **Payment Requests**: Generates a list of interviewers eligible for payment within a selected date range, calculating their earnings based on completed interviews and any added bonuses. From here, admins can send out payment confirmation and invoice emails.
  - **Payout Sheet**: Generates a formatted sheet for the finance team, ready for processing payouts.

### 4.6. Communication
- **Custom Email Center**: A flexible tool for mass communication.
  - Admins can create and manage HTML email templates with dynamic placeholders (e.g., {{Fullname}}).
  - Admins can then upload a list of recipients (CSV/XLSX) and send a bulk email using a selected template. A live preview is shown using the first row of data.

## 5. The Interviewer Portal
The Interviewer Portal is the personalized workspace for freelance interviewers.

### 5.1. Dashboard
**Purpose**: To provide a quick summary of the interviewer's activity and upcoming tasks.
**Key Functionalities**:
- Displays key metrics like scheduled, completed, and cancelled interviews, along with total earnings.
- Shows a list of upcoming scheduled interviews for easy access.

### 5.2. My Profile
**Purpose**: A central place for interviewers to manage their personal, professional, and financial information.
**Key Functionalities**:
- **Profile Details**: Update personal info (name, phone) and professional details (current employer, job title).
- **Experience & Skills**: Add, edit, or remove past work experiences and technical skills to keep their profile current.
- **Bank Information**: Securely enter and update bank account details for payment processing.
- **Security**: Change their account password.

### 5.3. Availability
**Purpose**: To respond to availability requests from Admins.
**User Flow**: This page lists all "requests for availability" sent by admins for specific dates. The interviewer can either:
- **Provide Availability**: Open a form to submit one or more time slots during which they are free on the requested date.
- **Decline**: Indicate they are not available on that date and provide a brief reason.

### 5.4. Scheduled Interviews (Interview Evaluation)
**Purpose**: To view and manage all assigned interviews in a calendar format.
**User Flow**: This page displays a weekly calendar view. Interviewers can see their scheduled interviews color-coded by status (Scheduled, Completed, etc.). They can click on any interview to view details (candidate name, time, meeting link) and update its status (e.g., from "Scheduled" to "Completed").

### 5.5. Domain Evaluation (My Performance)
**Purpose**: To allow interviewers to review their own past evaluation data.
**User Flow**: This feature mirrors the admin's Domain Evaluation tool but is scoped only to the logged-in interviewer's data. They can select one of their assigned domains and view all their past evaluations in a table format to track consistency and performance.

### 5.6. Payment History
**Purpose**: To provide a transparent record of all past earnings.
**User Flow**: Interviewers can select a date range (e.g., This Month, Last 6 Months) to view a summary of their earnings, including the total number of interviews completed and the total amount earned for that period, with a breakdown by domain.
`;

const DocsPage = () => {
    const [headings, setHeadings] = useState([]);

    const slugify = (text) => {
        return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    };

    useEffect(() => {
        const lines = documentationContent.trim().split('\n');
        const extractedHeadings = [];
        lines.forEach(line => {
            if (line.startsWith('### ')) {
                const title = line.substring(4).trim();
                extractedHeadings.push({ title, id: slugify(title), level: 3 });
            } else if (line.startsWith('## ')) {
                const title = line.substring(3).trim();
                extractedHeadings.push({ title, id: slugify(title), level: 2 });
            } else if (line.startsWith('# ')) {
                const title = line.substring(2).trim();
                extractedHeadings.push({ title, id: slugify(title), level: 1 });
            }
        });
        setHeadings(extractedHeadings);
    }, []);

    const renderMarkdown = (text) => {
        return text.trim().split('\n').map((line, index) => {
            const slug = slugify(line.replace(/#+\s*/, ''));
            if (line.startsWith('### ')) return <h3 key={index} id={slug} className="text-xl font-bold mt-8 mb-3 text-gray-800 scroll-mt-20">{line.substring(4)}</h3>;
            if (line.startsWith('## ')) return <h2 key={index} id={slug} className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-gray-300 text-gray-900 scroll-mt-20">{line.substring(3)}</h2>;
            if (line.startsWith('# ')) return <h1 key={index} id={slug} className="text-4xl font-extrabold mb-6 pb-4 border-b-2 border-blue-500 text-gray-900 scroll-mt-20">{line.substring(2)}</h1>;
            
            // --- START OF FIX ---
            // Add this new condition to handle lines like "**Purpose**:"
            if (line.startsWith('**')) {
                const boldPartMatch = line.match(/\*\*(.*?)\*\*/); // Find text between **
                if (boldPartMatch) {
                    const boldPart = boldPartMatch[1];
                    const rest = line.replace(`**${boldPart}**`, '');
                    return <p key={index} className="mb-2"><strong className="font-semibold text-gray-800">{boldPart}</strong>{rest}</p>;
                }
            }
            // --- END OF FIX ---
            
            if (line.startsWith('- **')) {
                const boldPart = line.match(/\*\*(.*?)\*\*/)[1];
                const rest = line.replace(`- **${boldPart}**`, '');
                return <p key={index} className="mb-2"><strong className="font-semibold text-gray-800">{boldPart}</strong>{rest}</p>;
            }
            if (line.startsWith('- ')) return <li key={index} className="ml-6 mb-2">{line.substring(2)}</li>;
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
                 return <li key={index} className="ml-6 mb-2">{line}</li>;
            }
            if (line.trim() === '') return <br key={index} />;
            return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{line}</p>;
        });
    };

    // ... (keep the rest of your component's return statement the same)
    
    return (
        <div className="bg-gray-100 font-sans">
            <style>{`html { scroll-behavior: smooth; }`}</style>
            <div className="container mx-auto flex">
                <aside className="w-1/4 h-screen sticky top-0 bg-white border-r border-gray-200 p-8 overflow-y-auto">
                    <h2 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-6">Contents</h2>
                    <nav>
                        <ul>
                            {headings.map(heading => (
                                <li key={heading.id} className={`${heading.level === 3 ? 'ml-4' : ''} mb-2`}>
                                    <a href={`#${heading.id}`} className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                        {heading.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <main className="w-3/4 p-10 bg-white">
                    <article className="prose max-w-none">
                        {renderMarkdown(documentationContent)}
                    </article>
                </main>
            </div>
        </div>
    );
};

export default DocsPage;
