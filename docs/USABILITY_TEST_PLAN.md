# Usability Test Plan – Member 2 Passenger Ticketing

## Goal
Check that first-time users can buy, show, manage and validate a bus ticket quickly and without errors, and measure perceived usability with the System Usability Scale (SUS).

## Participants (5)

| ID | Profile | Smartphone experience | Uses buses |
|---|---|---|---|
| P1 | University student | High | Daily |
| P2 | Working adult | High | Weekly |
| P3 | Senior citizen (60+) | Low–medium | Weekly |
| P4 | Student, first-time transit-app user | Medium | Rarely |
| P5 | Bus conductor or similar role (for scan tasks) | Medium | Daily |

## Setup
- Android phone with the app installed, backend running and seeded.
- Phone B logged in as `conductor@transitpulse.lk` for task T6.
- Each participant gets a fresh account (T1) or the demo passenger account.
- Moderator reads each task aloud, does not help unless the participant is stuck for > 2 min. Think-aloud is encouraged.
- Record: completion (Y / N / with help), time, errors, comments.

## Tasks

| Task | Scenario given to participant | Success criteria | Target time |
|---|---|---|---|
| T1 | "Create an account as a student." | Lands on Home with "Student passenger" | ≤ 2 min |
| T2 | "Buy a ticket on route 138 from Colombo Fort to Nugegoda for 2 people, leaving now, and pay with card 4242 4242 4242 4242." | Payment success screen reached | ≤ 3 min |
| T3 | "Show your ticket to the conductor." | Dynamic QR screen open | ≤ 30 s |
| T4 | "Your plans changed – cancel tomorrow's ticket. How much will you get back?" | Ticket cancelled and participant states the refund amount | ≤ 1.5 min |
| T5 | "Find the ticket you used yesterday and book the same trip again." | Rebook → Checkout reached | ≤ 1.5 min |
| T6 | (P5 / conductor role) "Check whether this passenger's ticket is valid." | Scan result read out correctly | ≤ 45 s |
| T7 | "Pay for a ticket with card 4000 0000 0000 0002." – then "What happened, and what can you do now?" | Participant understands the decline and retries with another method | ≤ 2 min |
| T8 | "Make your Mastercard the default card and remove the Visa." | Default changed and card removed | ≤ 1.5 min |
| T9 | "Change your phone number to 0771234567." | Profile updated | ≤ 1 min |

Overall success criteria: ≥ 80% task completion without help, mean SUS ≥ 68 (above average), no critical errors (e.g. paying twice, cancelling the wrong ticket).

## SUS questionnaire
Scale: 1 = Strongly disagree … 5 = Strongly agree

1. I think that I would like to use this app frequently.
2. I found the app unnecessarily complex.
3. I thought the app was easy to use.
4. I think that I would need the support of a technical person to be able to use this app.
5. I found the various functions in this app were well integrated.
6. I thought there was too much inconsistency in this app.
7. I would imagine that most people would learn to use this app very quickly.
8. I found the app very cumbersome to use.
9. I felt very confident using the app.
10. I needed to learn a lot of things before I could get going with this app.

Scoring: odd items → (score − 1); even items → (5 − score); sum × 2.5 = SUS (0–100).

## Post-test questions
- What was the easiest / hardest part?
- Was anything on the QR screen unclear (countdown, refresh)?
- Did you understand the refund amount before cancelling?

## Results – task completion (fill in)

| Participant | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | Errors | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | | | | | | | | | | | |
| P2 | | | | | | | | | | | |
| P3 | | | | | | | | | | | |
| P4 | | | | | | | | | | | |
| P5 | | | | | | | | | | | |

## Results – time on task in seconds (fill in)

| Participant | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 |
|---|---|---|---|---|---|---|---|---|---|
| P1 | | | | | | | | | |
| P2 | | | | | | | | | |
| P3 | | | | | | | | | |
| P4 | | | | | | | | | |
| P5 | | | | | | | | | |

## Results – SUS (fill in)

| Participant | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | SUS score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | | | | | | | | | | | |
| P2 | | | | | | | | | | | |
| P3 | | | | | | | | | | | |
| P4 | | | | | | | | | | | |
| P5 | | | | | | | | | | | |
| **Mean** | | | | | | | | | | | |

## Issues found (fill in)

| # | Task | Issue | Severity (1–4) | Proposed fix |
|---|---|---|---|---|
| | | | | |
