# Healing by VisionAce

Healing is a free, offline-first health guidance and records app, built for communities with limited access to clinics and unreliable internet.

**Live prototype:** https://healing-qqzf.vercel.app

> **Prototype.** Not reviewed by clinicians. Healing does not diagnose, and it does not replace a clinic or emergency services. In an emergency, call your local emergency number.

## What it does

- **Works offline after the first visit.** The app is saved on the phone with a service worker, so it opens with no signal.
- **Symptom urgency check.** Plain guidance on how urgent a symptom may be, with a red alert and a one-tap call button for danger signs.
- **Emergency plan.** Nearby clinics, the people who can get you there, directions in your own words, and one-tap call, WhatsApp and SMS options.
- **Health checks (estimates).** A pulse estimate from the phone camera and fingertip, a hand steadiness test using motion sensors, and manual entry of readings. Camera results are estimates and can vary by phone and lighting.
- **Pregnancy warning signs.** Checks blood pressure and symptoms against commonly used warning limits, with guidance to seek care.
- **Records on your phone.** Symptom logs, check-ins, voice notes, readings, medicines, appointments, a mood journal and family health history.
- **Doctor summary.** Choose which records to include, then print or save as PDF, or download a text file.
- **Backup and restore.** Export your records to a file, and add them back later.
- **Privacy.** A PIN lock, a privacy screen that explains what is saved and what leaves the phone, and an option to erase everything.
- **Languages.** English and French are fully translated. Hausa, Igbo and Yoruba cover the emergency and setup lines only, and those translations are drafts.
- **Accessibility.** Large text, a Read Screen button that uses the phone's voices, and voice input for symptoms where the browser supports it.

## Status

**Built and in testing:** PIN lock, privacy screen and erase option, offline install.

**Not built yet:**
- Cloud sync between devices
- A caregiver portal
- Medication interaction checking
- Disease detection or diagnosis
- A hosted news service

**Needs review:** health rules, danger-sign lists, the health articles and translations need review by clinicians and native speakers.

## Running locally

```bash
npm install
npm run dev
```

## Configuration

- **News (optional):** set `VITE_NEWS_URL` in a `.env.local` file to point to a news server. Without it, the news section shows "not set up yet".
- **Secrets:** never commit `.env.local` or any file containing keys. Anything starting with `VITE_` is visible to every visitor, so keep private keys out of it.

## Tech stack

React, TypeScript, Vite, Tailwind CSS, localStorage, a service worker, deployed on Vercel.

## Licence

Not yet decided. All rights reserved by VisionAce until a licence is chosen.