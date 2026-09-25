# Implementation Plan — Advanced Enhancements & Complete Feature Expansion

This plan outlines the design and technical steps for implementing all remaining advanced enhancements for **Legal Compass**. These features build upon our document-grounded analysis engine to provide executive-level exporting, risk customization, multi-document comparisons, and enhanced clause navigation.

---

## User Review Required

> [!IMPORTANT]
> All core analysis engine fixes and UI transformations are already active and verified. The proposed features below represent optional, high-value expansions to turn Legal Compass into a full enterprise-grade legal workspace.

> [!NOTE]
> No external paid APIs or heavy binary dependencies are required. All features will utilize native Web APIs (`@media print`, `Blob`, `URL.createObjectURL`) and existing React/Next.js architecture.

---

## Proposed Enhancements

### 1. Lawyer Prep Brief PDF Export & Formatted Print View
Enable users to export or print a professionally styled executive summary of the Lawyer Prep Brief (`/prepare/[documentId]`).

- Add an **Export Prep Brief (PDF)** button on the `/prepare/[documentId]` page.
- Implement `@media print` CSS utility rules in `index.css` to render a clean, high-contrast, multi-page PDF layout with headers, document summaries, critical dates table, top concerns, questions for legal counsel, and action items.
- Provide a downloadable client-side text/markdown report option as a lightweight alternative.

---

### 2. Interactive Risk Sensitivity & Threshold Controls
Allow users to adjust legal risk tolerance levels dynamically without re-uploading documents.

- **Risk Sensitivity Modes**:
  - **Strict (Conservative)**: Flags Net 15+ payment windows, broad IP assignments, and multi-year non-disclosures as High Risk.
  - **Standard (Default)**: Standard commercial risk rubrics.
  - **Flexible (Aggressive)**: Flags only severe liability caps and immediate termination breaches as High Risk.
- Add a **Risk Sensitivity Control Panel** modal inside [`ReviewPrioritiesSection.tsx`](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/components/situation-map/ReviewPrioritiesSection.tsx).
- Dynamically recalculate risk priorities in [`analysisEngine.ts`](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/lib/analysisEngine.ts).

---

### 3. Side-by-Side Multi-Document & Addendum Comparison (`/compare`)
Create a new comparison workspace for comparing two agreements (e.g., Original Agreement vs Amendment / SOW 1, or Vendor Proposal vs Standard Template).

- **New Page**: [`src/app/compare/page.tsx`](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/app/compare/page.tsx)
- **Features**:
  - Document Selector for Document A & Document B from uploaded files or test fixtures.
  - **Delta Risk Analysis**: Highlights new risks introduced in Document B or protections dropped from Document A.
  - **Side-by-Side Clause Alignment**: Aligns matching sections (Payment, Termination, IP) and highlights differences.
  - **Obligation Comparison**: Highlights shifting duties between parties across document versions.

---

### 4. Advanced Evidence Search & Filter in Document Viewer Modal
Enhance the full document clause viewer ([`DocumentViewerModal.tsx`](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/components/situation-map/DocumentViewerModal.tsx)) for rapid navigation.

- Add a live search bar matching terms across section titles and clause body text.
- Add category filter pills (`Payment`, `Termination`, `IP & Deliverables`, `Confidentiality`, `Liability`).
- Highlight search term matches directly in the clause text with gold background highlights.

---

## Proposed Changes

### Component & Page Architecture

---

#### [MODIFY] [page.tsx](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/app/prepare/%5BdocumentId%5D/page.tsx)
- Add "Export / Print Brief" button and `@media print` styling classes.
- Handle printable layout rendering.

#### [NEW] [RiskThresholdModal.tsx](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/components/action/RiskThresholdModal.tsx)
- Modal allowing users to adjust risk sensitivity (Strict, Standard, Flexible).

#### [MODIFY] [ReviewPrioritiesSection.tsx](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/components/situation-map/ReviewPrioritiesSection.tsx)
- Connect risk sensitivity state to filter and re-rank review priorities.

#### [NEW] [page.tsx](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/app/compare/page.tsx)
- Side-by-side document comparison route.

#### [NEW] [DocumentCompareView.tsx](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/components/compare/DocumentCompareView.tsx)
- Side-by-side diffing component for clauses, risks, and obligation deltas.

#### [MODIFY] [DocumentViewerModal.tsx](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/components/situation-map/DocumentViewerModal.tsx)
- Add live search input, category filter pills, and keyword highlighting.

#### [MODIFY] [Navbar.tsx](file:///c:/Users/SHUBHAM/OneDrive/Documents/Legal%20compass/src/components/layout/Navbar.tsx)
- Add link to "Compare Documents" in header navigation.

---

## Verification Plan

### Automated Build & Type Verification
- Run `npm run build` to ensure zero TypeScript errors or broken imports across all new routes.

### Manual Verification
1. **Lawyer Prep PDF Export**: Navigate to `/prepare/freelance`, click "Export / Print Brief", and verify print preview / PDF rendering.
2. **Risk Sensitivity Control**: Toggle Strict mode on `/analysis/freelance` and confirm risk priorities update dynamically.
3. **Document Comparison**: Open `/compare`, select `employment` and `freelance`, and verify side-by-side delta visualization.
4. **Document Viewer Search**: Open Document Viewer Modal, type `payment` or `14 days`, and verify live highlighting and filtering.
