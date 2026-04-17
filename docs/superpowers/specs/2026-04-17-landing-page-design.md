# Landing Page Redesign — Implementation Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the minimal homepage (`src/app/page.tsx`) with a full institutional-quality landing page that positions National Health Career Academy as a serious US healthcare education provider.

**Design Direction:** Option A — Institutional Authority (dark navy, stats bar, certification grid, BLS-sourced salaries)

**Logo:** Shield & Cross SVG — navy shield with white medical cross, "National Health Career / ACADEMY" wordmark

**Approved Mockup:** `.superpowers/brainstorm/912-1776440891/content/final-mockup.html`

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Navy dark | `#0f2b5b` | Navbar, hero bg, section headings |
| Navy mid | `#1e3a8a` | Stats bar, final CTA |
| Blue primary | `#2563eb` | Buttons, step circles, borders |
| Blue light | `#60a5fa` | Accents, logo stroke, nav links |
| Blue muted | `#93c5fd` | Subtext on dark backgrounds |
| Navy pale | `#bfdbfe` | Body text on dark backgrounds |
| Light bg | `#f8fafc` | Programs section bg |
| Blue tint | `#f0f7ff` | Why section bg |
| Green accent | `#16a34a` | Step 4 "Get Hired", salary section |
| Green bg | `#ecfdf5` | Salary section bg |

---

## Logo SVG

Saved as `public/logo.svg`. Also used inline in Navbar component.

```svg
<svg width="42" height="42" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 2L6 9v11c0 10 7 19 16 21 9-2 16-11 16-21V9L22 2z"
        fill="#1e4d9b" stroke="#60a5fa" stroke-width="1.5"/>
  <rect x="18" y="12" width="8" height="20" rx="2" fill="white"/>
  <rect x="12" y="18" width="20" height="8" rx="2" fill="white"/>
</svg>
```

White version (on dark bg): same SVG, stroke `#60a5fa`. Color version (on white): stroke `#2563eb`.

---

## Navbar Update

**File:** `src/components/layout/Navbar.tsx`

- Replace text logo with Shield SVG + wordmark
- Links: Programs · Courses · About · Contact · EN/ES toggle
- Right: "Enroll Now →" button (blue-600)
- Background: `#0f2b5b` with `border-bottom: 2px solid #1d4ed8`
- Height: 64px

---

## Sections

### ① Hero

**File:** `src/components/home/HeroSection.tsx`

**Layout:** Full-width gradient background with a right-side healthcare professional photo overlapping into the stats bar below.

**Background:** `linear-gradient(135deg, #0f2b5b 0%, #1e4d9b 55%, #1a6b9a 100%)`

**Image:**
- Position: Right side of hero, 45% width, full height, `object-fit: cover`, slightly overlapping the bottom
- Source: Unsplash — `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80` (female medical professional in scrubs, smiling)
- Fallback: `https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80`
- On mobile: image hidden, full-width text layout

**Content (left side, ~55% width):**
- Badge pill: `🎓 NHA Certification Exam Prep | English & Spanish`
- H1: `Launch Your Healthcare Career` / `in as Little as 4–6 Months` (span in blue-400)
- Body: "Online, self-paced programs designed to prepare you for nationally recognized NHA certifications. Join thousands of graduates now working in hospitals and clinics across the United States."
- CTAs: `Browse Programs →` (blue-600 filled) · `Free Info Session` (white outline)
- Trust row: `✓ No prior experience required` · `✓ Available in English & Spanish` · `✓ 100% Online & Self-Paced` · `✓ NHA Exam Prep Included`

---

### ② Stats Bar

**File:** `src/components/home/StatsBar.tsx`

**Background:** `#1e3a8a`, `border-bottom: 2px solid #1d4ed8`

**No image** — pure data/numbers. Dividers between stats.

**Stats (5 columns):**
| Value | Label |
|-------|-------|
| 2,400+ | Graduates |
| 8 | Certification Programs |
| 94% | NHA Pass Rate |
| $38K–$55K | Avg. Starting Salary (USA) |
| 4.8 ★ | Instructor Rating |

---

### ③ Programs Grid

**File:** `src/components/home/ProgramsSection.tsx`

**Background:** `#f8fafc`

**Section image:** Small circular or pill-shaped Unsplash thumbnail on each program card (right-aligned, 60×60px, rounded-full, `object-fit: cover`).

**Card image sources (Unsplash, 120×120, cropped to circle):**

| Program | Unsplash URL |
|---------|-------------|
| Medical Assistant | `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&q=80` |
| Phlebotomy Technician | `https://images.unsplash.com/photo-1579154204601-01588f351e67?w=120&q=80` |
| EKG Technician | `https://images.unsplash.com/photo-1516069677018-378515003435?w=120&q=80` |
| Medical Coding & Billing | `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&q=80` |
| Anatomy & Physiology | `https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=120&q=80` |
| Medical Law & Ethics | `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=120&q=80` |
| Intro to Healthcare | `https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&q=80` |
| Medical Insurance | `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=120&q=80` |

**8 program cards in a 4-col grid (2-col on mobile):**

| Program | Cert | Top Border | Tag |
|---------|------|-----------|-----|
| Medical Assistant | CCMA Prep | `#2563eb` | ● Most Popular |
| Phlebotomy Technician | CPT Prep | `#0891b2` | ● High Demand |
| EKG Technician | CET Prep | `#dc2626` | ● Growing Field |
| Medical Coding & Billing | CBCS Prep | `#16a34a` | ● Remote-Friendly |
| Anatomy & Physiology | Foundation | `#7c3aed` | ● Core Prerequisite |
| Medical Law & Ethics | HIPAA · Rights | `#ca8a04` | ● Required for MA |
| Intro to Healthcare | Start here | `#0f172a` | ● First Lesson Free |
| Medical Insurance | CMAA Prep | `#db2777` | ● Office-Focused |

Each card links to `/courses/[slug]`. "View All Programs →" outline button below grid links to `/courses`.

---

### ④ Path to Certification

**File:** `src/components/home/PathwaySection.tsx`

**Background:** white, `border-top: 1px solid #e2e8f0`

**Layout:** 4-step horizontal flow with connecting lines. Below the steps: a wide banner image of a healthcare team.

**Banner image:**
- Source: `https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80` (medical team, diverse, professional)
- Size: full width, height 200px, `object-fit: cover`, `border-radius: 12px`, `margin-top: 32px`
- Overlay: dark gradient `linear-gradient(to right, rgba(15,43,91,0.7), rgba(15,43,91,0.3))` with white text: "Your future starts with a single step."

**Steps:**
1. Choose a Program — 8 career tracks available
2. Learn Online — Self-paced, EN & ES
3. Pass the NHA Exam — Fully prepared with us
4. **Get Hired** (green) — $38K–$55K/yr USA

---

### ⑤ Why NHA Academy

**File:** `src/components/home/WhySection.tsx`

**Background:** `#f0f7ff`

**Layout:** Section title centered, then 3-col grid of 6 cards. To the right of the grid title: a vertical accent image.

**Accent image (right side of heading row):**
- Source: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80` (student studying online, laptop)
- Size: 280px wide, 200px tall, `object-fit: cover`, `border-radius: 12px`
- Shown only on desktop (hidden on mobile)

**6 value prop cards:**

| Icon | Title | Description |
|------|-------|-------------|
| 🎓 | Expert-Led Instruction | Certified healthcare educators with real clinical experience in US hospitals and clinics. |
| 🌐 | Bilingual — English & Spanish | Every program is available in both languages. No student gets left behind. |
| 📱 | 100% Online & Self-Paced | Study from anywhere, anytime. No rigid schedule, no commute, no classroom. |
| 🏆 | NHA Exam Preparation | Curriculum built around official NHA competencies — CCMA, CPT, CET, CBCS and more. |
| 💼 | Career Support | Resume guidance, interview prep, and salary benchmarks for the US healthcare market. |
| 💰 | Affordable Tuition | A fraction of the cost of community college — with the same nationally recognized NHA certification outcome. |

---

### ⑦ Testimonials

**File:** `src/components/home/TestimonialsSection.tsx`

**Background:** `#0f2b5b`

**Layout:** 3-column grid of quote cards. Each card has a student avatar (circular photo, 48px).

**Student avatar images:**

| Student | Unsplash URL |
|---------|-------------|
| Maria G. (CCMA, Houston TX) | `https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&q=80` (Latina woman smiling) |
| James R. (CET, Miami FL) | `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80` (man, professional) |
| Carmen V. (CPT, Orlando FL) | `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80` (woman, warm smile) |

**Card design:** dark semi-transparent background, colored left border (blue / green / cyan), avatar + name + credential badge above quote.

**Quotes:**
- Maria G.: "I went from zero healthcare experience to a certified Medical Assistant in 5 months. The bilingual materials made all the difference — I could study in Spanish when English got tough."
- James R.: "The EKG program was incredibly thorough. The practice quizzes are almost exactly like the real CET exam. I passed on my first attempt and had a job offer within 3 weeks."
- Carmen V.: "As a single mother working full-time, self-paced learning was the only option for me. NHA Academy made it possible. I'm now a Certified Phlebotomy Technician earning $22/hr."

---

### ⑧ Salary Outcomes

**File:** `src/components/home/SalariesSection.tsx`

**Background:** `#ecfdf5`, `border-top: 3px solid #16a34a`, `border-bottom: 3px solid #16a34a`

**Layout:** Heading + subtext centered. 4-col salary card grid. Below: a US map illustration or BLS source note.

**Map/chart image:**
- Source: `https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&q=80` (US healthcare workplace)
- Alternatively use a simple inline SVG outline of the US map with state markers
- Size: full width, max-height 160px, `object-fit: cover`, muted green overlay, displayed below salary cards
- Caption overlay: "Data sourced from U.S. Bureau of Labor Statistics, Indeed & Glassdoor — 2025 national averages"

**4 salary cards:**

| Career | Salary Range | Certification |
|--------|-------------|--------------|
| Medical Assistant | $38K–$50K | CCMA Certified |
| Phlebotomy Technician | $36K–$52K | CPT Certified |
| EKG Technician | $40K–$58K | CET Certified |
| Coding & Billing | $42K–$62K | CBCS Certified |

---

### ⑨ Final CTA

**File:** `src/components/home/CtaBanner.tsx`

**Background:** `linear-gradient(135deg, #1e3a8a, #0f2b5b)` with a subtle background image at low opacity.

**Background image:**
- Source: `https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1400&q=80` (hospital corridor, professional)
- CSS: `background-blend-mode: overlay`, opacity 0.15, `object-fit: cover`

**Content:**
- H2: "Ready to Start Your Healthcare Career?"
- Subtext: "Join thousands of students already on their path to NHA certification and a rewarding career."
- CTAs: `Browse All Programs →` (blue filled) · `Contact Admissions` (white outline)

---

## File Structure

```
src/
  app/
    page.tsx                          ← MODIFY: import and compose all sections
  components/
    layout/
      Navbar.tsx                      ← MODIFY: add shield logo SVG + updated links
    home/                             ← CREATE directory
      HeroSection.tsx
      StatsBar.tsx
      ProgramsSection.tsx
      PathwaySection.tsx
      WhySection.tsx
      TestimonialsSection.tsx
      SalariesSection.tsx
      CtaBanner.tsx
public/
  logo.svg                            ← CREATE: shield & cross SVG
```

---

## Technical Notes

- **Images:** Use Next.js `<Image>` component with `width`, `height`, and `alt`. Add `images.unsplash.com` to `next.config.ts` `remotePatterns`.
- **No new dependencies** — Tailwind CSS only, no additional UI libraries.
- **Responsive:** All sections must be mobile-friendly. 4-col grids → 2-col → 1-col. Hero image hidden on mobile.
- **Existing routes preserved:** `/courses`, `/admin`, `/login`, `/dashboard` — no changes.
- **Navbar:** Update existing `Navbar.tsx` — do not create a new one.
- **Performance:** Hero image uses `priority` prop. All other images use lazy loading.
- **Accessibility:** All images have descriptive `alt` text. Decorative images use `alt=""`.
- **next.config.ts remotePatterns entry:**
  ```ts
  { protocol: 'https', hostname: 'images.unsplash.com' }
  ```
