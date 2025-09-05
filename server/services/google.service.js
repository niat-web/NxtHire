// server/services/google.service.js
const { google } = require('googleapis');
const { logEvent, logError } = require('../middleware/logger.middleware');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TIMEZONE = "Asia/Kolkata";

let authClient = null;

async function getAuthClient() {
    // Return the cached client if it already exists
    if (authClient) return authClient;

    try {
        // --- PRODUCTION-READY: Read credentials and token from environment variables ---
        // This is more secure and works better in deployment environments.
        if (!process.env.GOOGLE_CREDENTIALS_JSON || !process.env.GOOGLE_TOKEN_JSON) {
            logError('google_auth_error', new Error('Google credentials are not set in environment variables.'));
            throw new Error('Google API credentials are not configured in environment variables.');
        }

        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        const { client_secret, client_id, redirect_uris } = credentials.installed;

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(JSON.parse(process.env.GOOGLE_TOKEN_JSON));
        // --- END PRODUCTION-READY AUTH ---

        // The google-auth-library handles token refreshing in memory.
        // We will just log the event without writing to a file.
        oAuth2Client.on('tokens', (tokens) => {
            logEvent('google_token_refresh_event_triggered');
            if (tokens.access_token) {
                logEvent('google_access_token_refreshed_in_memory');
            }
        });

        // Cache the authenticated client for subsequent requests
        authClient = oAuth2Client;
        return authClient;
    } catch (error) {
        logError('google_auth_error', error);
        console.error('Error during Google authentication setup:', error.message);
        throw new Error('Failed to configure Google API authentication.');
    }
}

async function fetchRecentCalendarEvents() {
    try {
        const oAuth2Client = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

        // Fetch events from the last 7 days.
        const timeMin = new Date();
        timeMin.setDate(timeMin.getDate() - 7);

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            maxResults: 250, // Max results per page
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = res.data.items;
        logEvent('google_calendar_events_fetched', { count: events.length });
        
        // This function correctly fetches the full event object, including the 'attachments' 
        // array which is needed to find both recordings and transcripts. No changes are needed here.
        return events;
    } catch (error) {
        logError('google_calendar_fetch_error', error);
        console.error('Error fetching Google Calendar events:', error.message);
        throw new Error('Could not fetch Google Calendar events.');
    }
}

const createCalendarEvent = async ({ summary, description, start, end, attendees }) => {
    try {
        const oAuth2Client = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

        const validAttendees = attendees
            .filter(email => email && typeof email === 'string' && email.includes('@'))
            .map(email => ({ email }));

        const event = {
            summary,
            description,
            start: { ...start, timeZone: TIMEZONE },
            end: { ...end, timeZone: TIMEZONE },
            attendees: validAttendees,
            conferenceData: {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            },
        };

        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1,
        });

        logEvent('google_calendar_event_created', { eventId: res.data.id, summary });
        return res.data;
    } catch (error) {
        logError('google_calendar_creation_error', error, { summary });
        console.error('Error creating Google Calendar event:', error.message);
        throw new Error('Could not create Google Calendar event.');
    }
};

module.exports = { createCalendarEvent, fetchRecentCalendarEvents };
