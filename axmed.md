# AXMED Marketplace: Complete Context for LLM Training

This document defines the core identity, operational environment, strategic challenges, and specific business rules of AXMED. This context should be used for all subsequent analytical, strategic, and design-related inquiries.

## 1. Core Identity, Mission, and Metrics

| Category | Description |
|----------|-------------|
| **Name** | AXMED |
| **Sector** | Health-Tech / Public Health / Pharmaceutical Supply Chain |
| **Mission** | To revolutionize access to high-quality, affordable medicines and essential medical services, primarily focused on Low and Middle-Income Countries (LMICs). |
| **Business Model** | B2B Demand Aggregation Marketplace. AXMED operates as a neutral platform connecting multiple buyers and multiple pre-qualified manufacturers/suppliers. |
| **Primary Metric** | Transaction Value (Total monetary value of goods traded on the platform). |
| **Top Priority (Tech Team)** | Buyer Adoption (Getting external buyers to independently transact on the platform). |

## 2. The Core Problem & AXMED's Value Proposition

### The Market Gap (The Problem)

The current pharmaceutical supply chain in LMICs is inefficient, protectionist, and non-transparent. Key issues include:

- **High Cost & Low Access**: Buyers face high, fluctuating costs and limited access due to inefficient distribution.
- **Protectionism**: Existing local distributors often gatekeep access, blocking new market entrants.
- **Manual & Inefficient**: Buyers rely on manual methods (emailing 50+ suppliers) and heavy internal "hand-holding" from AXMED Ops teams.
- **Perception Gap**: Buyers view AXMED as "just another supplier," not a marketplace.

### The AXMED Solution (Value Proposition)

AXMED shifts procurement to a **Supplier-Independent Procurement (SIP)** model.

- **Demand Aggregation**: Buyers gain the purchasing power of a larger entity (25-30% cost savings).
- **Fixed Pricing**: Locked rates (6-12 months) and currency fluctuation protection.
- **Transparency**: Full visibility into supplier certifications and deal stages.
- **Efficiency**: Eliminates middlemen and automates manual processes.

## 3. Key User Profiles and Pain Points

### A. Buyers (Healthcare Providers, NGOs, FBOs)

- **Context**: Success is highest with NGOs/FBOs due to donor accountability. Government agencies are harder to penetrate.
- **Pain Points**: Trust barriers, habit of manual emailing, fear of losing high-value deals if they switch methods.
- **Commercial Context**: The internal Commercial team is sometimes hesitant to push buyers to the platform for fear of messing up "million-dollar deals." Design must support the Commercial team's workflow too.

### B. Sellers (Manufacturers and Suppliers)

- **Context**: High adoption (70-75% for bids).
- **Pain Points (Supplier Fatigue)**: No feedback on lost bids, no "bid recall" (fixing a mistake requires re-entry), repeated data entry for same products.
- **Needs**: One-click bidding, bid templates, and transparent feedback (e.g., "Lost to 7 competitors due to price").

## 4. Operational Products and Technical Environment

- **Pitchfork**: Internal AI-powered web interface used by Ops/Commercial. Processes client Excel/CSV files and auto-matches products (via Haystack algorithm). Current UX for creating new products/mismatches is complex and causes friction.
- **Bridge Design System**: The new design system (Ant Design-based). Priorities: Design Tokens (Color, Type, Spacing) and standard components.
- **LMIC Constraints**: Designs must optimize for Low Bandwidth (minimalist UI), Low Digital Literacy (clear text labels), and Mobile Performance.

## 5. Critical Business Rules & Logic (Edge Cases)

### The Bidding Window Logic

- **Soft Deadline**: The bidding window has an end date, but the tender does not close automatically. It enters a "Closing Soon" state until manually closed by the Commercial team.
- **The 14-Day Rule**: Regardless of when the window closes, a supplier's bid MUST be valid for at least 14 days AFTER the window closes to allow for evaluation.
- **Extensions**: If a tender is extended, suppliers who already bid must be notified and allowed to update their bid validity.

### Onboarding & Verification

- **Progressive Unlocking**: Features are unlocked based on regulatory compliance depth.
- **Verification**: Users may have tiered access based on verification milestones.

## 6. Emerging Feature Concepts (To Be Designed)

- **Gamification**: Profile progress bars, opportunity previews during onboarding (e.g., "2,000 SKUs moved in your region").
- **Bulk Upload**: A seamless Excel/CSV upload tool for buyers to automate order creation (replacing email).
- **Fuzzy Search**: When a drug search yields no exact match, show related/similar items to prevent dead ends.
- **Automated Repeat Ordering**: Tools for buyers to easily re-order frequently purchased goods.
- **WhatsApp Integration**: Exploring use cases for notifications or simple order interactions.

## 7. Strategic Design Mandate

- **Shift Perception**: Every screen must reinforce "Marketplace," "Aggregation," and "Purchasing Power."
- **Automate Manual Work**: Build tools (Bulk Upload, Pitchfork improvements) that remove the need for Ops hand-holding.
- **Continuous Guidance**: Move away from "throw users in a room" onboarding. Embed continuous, educational UX guidance.
