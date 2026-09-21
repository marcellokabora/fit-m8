# Feature Specification: Trainer AI Conversational Agent

## 1. Executive Summary

The **Trainer AI Conversational Agent** is an automated assistant designed to help trainers turn interested leads into active clients or event participants. Actively representing the trainer based on custom parameters, the AI handles incoming inquiries, qualifies prospects, answers FAQs, and drives conversions through **sharing external event ticket links**, **real-time Google Calendar availability lookup with optional lead capture**, or **direct contact collection**.

## 2. Goals & Objectives

* **Scale Prospecting:** Allow trainers to engage potential clients 24/7 without manual effort.

* **Higher Lead Conversion:** Fast response times and structured conversation flows to capture user interest at peak intent.

* **Low-Risk Event Promotion:** Share direct external event links (e.g., Eventbrite, Luma, website) directly in conversation without handling complex in-app financial transactions or liability.

* **Dynamic Schedule Lookup & Lead Capture:** Query trainer availability via Google Calendar API (`freebusy.query`), let prospects select a slot, and capture their contact info (including an optional phone number) prior to creating the booking (`events.insert`).

## 3. User Roles & Personas

* **The Trainer (Host):** Configures the agent's knowledge base, persona/tone, external event/ticket links, and connects their Google Calendar via OAuth 2.0.

* **The Prospect (User):** A user browsing the platform who wants to know more about a trainer's programs, schedules, pricing, or style before committing.

## 4. End-to-End User Flow

```
[Prospect Opens Chat] 
       │
       ▼
[AI Initiates / Responds based on Trainer Setup] 
       │
       ▼
[Nurture & Answer Inquiries (FAQs, Style, Services, Pricing)]
       │
       ├───► [Conversion Path A: External Ticket / Event Link] ──► [Direct Link to External Checkout]
       │
       ├───► [Conversion Path B: Google Calendar Integration] ──► [Select Slot] ──► [Optional Phone/Lead Prompt] ──► [Book Event]
       │
       └───► [Conversion Path C: Standalone Phone Capture] ──► [Lead Handed Off to Trainer]
```

### Step 1: Trainer Setup & Customization

Trainers navigate to their dashboard settings to configure their AI Agent. They can define:

1. **Persona & Tone:** Friendly, energetic, direct, elite-coaching, etc.

2. **Knowledge Base / Business Context:**

   * Specializations & training philosophy.

   * Session options (1-on-1, small groups, workshops).

   * Frequently Asked Questions (pricing ranges, location/online details, prerequisites).

3. **External Event & Ticket Promotion:**

   * Event details: Title, description, and direct external booking URL (e.g., Luma, Eventbrite, or custom landing page).

4. **Calendar Integration Setup (Google Calendar API):**

   * **Google OAuth 2.0 Integration:** Connect Google Account (`https://www.googleapis.com/auth/calendar.events` and `freebusy` read access).

   * **Working Hours & Slot Rules:** Define active working hours (e.g., Mon–Fri 9 AM – 5 PM), buffer times between sessions (e.g., 15 mins), and standard session duration (e.g., 45 mins).

   * **Default Event Settings:** Set default meeting location or auto-generate Google Meet video links for online sessions.

5. **Phone Collection Goal:** Toggle whether to prompt for phone numbers in general chat or during calendar confirmation.

### Step 2: Prospect Conversation

* A prospect clicks **"Chat with Trainer's Assistant"** or **"Ask a Question"** on the trainer’s profile or event page.

* The AI Agent greets the user and answers questions using the context provided by the trainer.

* The agent actively guides the conversation toward ticket links, calendar scheduling, or contact collection based on user intent signals.

### Step 3: Conversation Closing & Conversion

#### Option A: External Event / Ticket Link

* **Trigger:** Prospect expresses interest in joining an upcoming workshop, class, or group event.

* **Action:** The agent presents an event card with a direct call-to-action button linking to the external ticketing page provided by the trainer.

* **Outcome:** The user clicks out to complete their purchase on the external provider with zero payment risk on the platform.

#### Option B: Real-Time Google Calendar Booking + Optional Phone Capture

* **Trigger:** Prospect asks about trainer availability, free consultations, or booking a 1-on-1 session (e.g., "Are you free Thursday afternoon?").

* **Action:**

  1. The AI Agent queries the backend service, which calls Google Calendar API (`POST /calendar/v3/freebusy`) for the specified timeframe.

  2. The system intersects the busy blocks returned by Google Calendar with the trainer's configured working hours and slot durations to calculate exact free slots.

  3. The agent presents open options directly in chat (e.g., "Coach Alex has openings this Thursday at 2:00 PM and 4:00 PM, or Friday at 10:00 AM.").

  4. **Slot Selection & Lead Collection:** Once the prospect taps a time slot, the agent prompts: *"Awesome! To confirm your booking, what is your email? (Optional: Leave your phone number if you'd like SMS reminders or follow-ups from Coach Alex)."*

  5. Upon confirmation, the backend calls `POST /calendar/v3/calendars/primary/events` to create the event on the trainer's Google Calendar with attendee details, and logs the captured phone lead to the trainer dashboard.

* **Outcome:** The session is booked on Google Calendar, invitations are dispatched, and the trainer gets a lead with optional phone contact details for direct follow-up.

#### Option C: Standalone Phone Number Capture

* **Trigger:** Prospect asks for custom long-term training, bespoke pricing, or requests direct communication with the trainer without booking a specific calendar slot.

* **Action:** The agent prompts: "Coach handles custom coaching programs personally! What’s the best phone number to text/call you at?"

* **Outcome:** The system validates and saves the phone number, then sends an instant lead alert to the trainer's dashboard or notification channels.

## 5. Key Functional Requirements

### 5.1 Configuration Engine (Trainer Dashboard)

* **Prompt & Knowledge Form:** Structured fields for FAQs, guidelines, and boundaries.

* **External Link Manager:** Interface to input event names and external registration/ticketing URLs.

* **Google OAuth 2.0 Integration:** Flow for trainers to authenticate their Google Account and grant calendar permissions.

* **Availability Engine Config:** UI for trainers to set weekly recurring availability windows, buffer times, and session lengths.

### 5.2 AI Chat & Integration Interfaces (Prospect View)

* **External Link Card:** Interactive chat element displaying event title and an external link button opening in a new tab.

* **Interactive Slot Picker Card:** Chat UI element populated via Google `freebusy` calculation, letting users tap on an available date/time slot.

* **In-Chat Booking Confirmation & Lead Form:** Form fields inside chat collecting Email (required) and Phone Number (optional, with SMS reminder explanation).

* **Form Inputs in Chat:** Smooth inline phone number entry with validation.

### 5.3 Lead & Booking Analytics (Trainer Dashboard)

* **Click-Through Tracking:** Count of how many users clicked on external event/ticket links during conversations.

* **Google Calendar Booking Log:** List of sessions booked directly via Google Calendar API with attendee details, meeting links, and optional phone numbers captured.

* **Trainer Lead Inbox:** Centralized list of captured phone leads with full chat history context.

## 6. Success Metrics & Key Performance Indicators (KPIs)

* **External Ticket Link CTR:** % of users who click through to external ticket pages after being shown the event link.

* **Calendar Booking Completion Rate:** % of users who confirm a Google Calendar slot after options are displayed in chat.

* **Lead Capture Rate:** % of calendar bookings that include an optional phone number.

* **Engagement Rate:** % of profile visitors who start a chat.

## 7. Next Steps & Implementation Milestones

1. **Phase 1: Knowledge Base & External Link Sharing (MVP)**

   * Build trainer dashboard setup forms for FAQs and external event URLs.

   * Develop in-chat message handling and interactive link cards.

2. **Phase 2: Google Calendar Integration & Booking Lead Capture**

   * Implement Google OAuth 2.0 authentication flow for trainers.

   * Build the backend Availability Engine using `freebusy.query` combined with working hour rules.

   * Build in-chat booking confirmation flow with optional phone number capture.

   * Implement automatic event creation via `events.insert` (with Google Meet integration).

3. **Phase 3: Lead Inbox & Notifications**

   * Add central lead management and instant alerts for trainers upon booking/phone collection.

4. **Phase 4: Advanced Analytics & AI Persona Fine-Tuning**

   * Analytics dashboard for conversion performance and conversational insights.