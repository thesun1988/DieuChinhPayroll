# Implementation Plan: Nail Salon Payroll Transition

## Overview

Single-page React application (React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion) helping Vietnamese nail salon owners in the US transition from cash/check payroll to 100% check. The app runs entirely client-side with no backend — all calculations happen in the browser and data persists via localStorage. The UX follows a linear flow: Landing → Disclaimer Popup → Input Form → Analysis Animation → Results View, managed by React state (FlowContext) without URL routing.

## Tasks

- [x] 1. Set up project structure, tooling, and core types
  - [x] 1.1 Initialize Vite + React + TypeScript project with Tailwind CSS and Framer Motion
    - Run `npm create vite@latest` with React + TypeScript template
    - Install dependencies: tailwindcss, postcss, autoprefixer, framer-motion, jspdf, fast-check (dev), vitest (dev), @testing-library/react (dev), jsdom (dev)
    - Configure Tailwind CSS with responsive breakpoints (768px mobile threshold)
    - Configure Vitest in `vite.config.ts`
    - Set up `src/index.css` with Tailwind directives
    - _Requirements: 4.4, 4.5_

  - [x] 1.2 Create TypeScript interfaces and type definitions
    - Create `src/context/types.ts` with all core interfaces: TaxInput, TaxResult, EmployerTaxes, EmployeeTaxes, SelfEmploymentTaxes, RoadmapInput, Phase, Roadmap, StoredData, FlowStep, FlowState, FlowAction, AppState
    - Create `src/data/taxRates.ts` with FederalTaxBracket, StateData, TaxRatesConfig interfaces and 2024 federal tax data
    - Create `src/data/stateData.ts` with state-specific SUTA and income tax rates for all US states
    - _Requirements: 2.3, 2.4, 2.5, 2.11_

  - [x] 1.3 Create project directory structure
    - Create folder structure matching the design: components/ (layout, landing, disclaimer, form, animation, results, classification, common), utils/, data/, context/, hooks/
    - _Requirements: All_

- [x] 2. Implement core utility modules
  - [x] 2.1 Implement validators (`src/utils/validators.ts`)
    - Implement `validateCashPercent` — reject values outside [0, 100]
    - Implement `validateSplitRatio` — reject non-positive owner or worker values
    - Implement `validateRevenue` — reject non-positive values
    - Implement `validateWorkerCount` — reject non-positive or non-integer values
    - Implement `validateCalculatorInput` — composite validation for TaxInput
    - Implement `validateRoadmapInput` — composite validation for RoadmapInput
    - All error messages in Vietnamese
    - _Requirements: 1.5, 2.1_

  - [x]\* 2.2 Write property test for input validation (Property 13)
    - **Property 13: Invalid input rejection**
    - **Validates: Requirements 1.5**
    - File: `src/__tests__/properties/validators.property.test.ts`
    - Use fast-check to generate cashPercent outside [0,100], non-positive split ratios, negative revenue, non-positive worker count
    - Assert validator returns `{ valid: false }` with at least one Vietnamese error message

  - [x] 2.3 Implement formatters (`src/utils/formatters.ts`)
    - Implement `formatUSD` — format as `$X,XXX.XX` with comma-separated thousands and 2 decimal places
    - Implement `formatPercent` — format as `XX%`
    - Implement `formatRatio` — format as `X/Y` (e.g., "4/6")
    - Implement `formatMonth` — format as "Tháng X" (Vietnamese)
    - _Requirements: 4.3_

  - [x]\* 2.4 Write property test for USD formatting (Property 10)
    - **Property 10: USD formatting correctness**
    - **Validates: Requirements 4.3**
    - File: `src/__tests__/properties/formatters.property.test.ts`
    - Use fast-check to generate non-negative numbers
    - Assert output matches `$X,XXX.XX` pattern and round-trip parsing preserves value

  - [x] 2.5 Implement tax calculator (`src/utils/taxCalculator.ts`)
    - Implement `calculateW2Tax` — compute employer taxes (SS 6.2%, Medicare 1.45%, FUTA 0.6%, SUTA state-specific) and employee taxes (federal income, state income, SS 6.2%, Medicare 1.45%)
    - Implement `calculate1099Tax` — compute self-employment tax (15.3% on 92.35% of income), estimated quarterly tax
    - Implement `calculateTax` — main function combining worker income calculation, tax computation, cost comparison, minimum wage check, and Form 1099-NEC threshold
    - Implement `compareW2vs1099` — run both W-2 and 1099 calculations for comparison
    - Worker gross income = monthlyRevenue × (worker / (owner + worker))
    - Minimum wage check: hourlyRate = (workerGrossIncome / numberOfWorkers) / (hoursPerWeek × 4.33)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.10, 2.12_

  - [x]\* 2.6 Write property tests for tax calculator (Properties 3, 4, 5, 6, 7, 8, 9)
    - **Property 3: Worker income calculation correctness**
    - **Property 4: W-2 employer tax calculation correctness**
    - **Property 5: W-2 employee tax calculation correctness**
    - **Property 6: 1099 self-employment tax calculation**
    - **Property 7: Form 1099-NEC threshold detection**
    - **Property 8: Cost comparison monotonicity**
    - **Property 9: Minimum wage violation detection**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.10, 2.12**
    - File: `src/__tests__/properties/taxCalculator.property.test.ts`
    - Use fast-check to generate valid TaxInput with arbitrary positive revenue, split ratios, and cash percentages

  - [x] 2.7 Implement roadmap generator (`src/utils/roadmapGenerator.ts`)
    - Implement `generateRoadmap` — produce transition phases based on current cash percentage
    - Cash ≤ 30%: 3 phases over 6 months
    - Cash 31-60%: 4 phases over 9-12 months
    - Cash > 60%: 5-6 phases over 12-18 months
    - Constraint: each phase reduces cash by max 15 percentage points
    - First phase cashPercent < input cashPercent, last phase cashPercent = 0
    - Each phase includes phaseNumber, checkPercent, cashPercent, durationMonths, startMonth, endMonth, notes (Vietnamese)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x]\* 2.8 Write property tests for roadmap generator (Properties 1, 2)
    - **Property 1: Roadmap phases are complete and well-structured**
    - **Property 2: Roadmap duration scales with cash percentage**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - File: `src/__tests__/properties/roadmapGenerator.property.test.ts`
    - Use fast-check to generate valid RoadmapInput (cashPercent in [1, 100], positive split ratios)
    - Assert phase structure, duration ranges, max 15% reduction per phase

- [x] 3. Checkpoint - Ensure all utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement data layer and storage
  - [x] 4.1 Implement localStorage wrapper (`src/utils/storage.ts`)
    - Implement `saveData` — merge partial data into stored object, update lastUpdated timestamp
    - Implement `loadData` — parse stored JSON, handle corrupted data gracefully (return null)
    - Implement `clearAllData` — remove all keys from localStorage
    - Implement `hasStoredData` — check if valid data exists
    - Handle localStorage unavailable (private browsing) — show warning, continue without persistence
    - Handle QuotaExceededError — show warning, continue without save
    - localStorage key: `nail-salon-payroll-data`
    - Disclaimer key: `nail-salon-disclaimer-accepted`
    - _Requirements: 5.1, 5.2, 5.4, 7.6_

  - [x]\* 4.2 Write property tests for storage (Properties 11, 12)
    - **Property 11: Storage round-trip preservation**
    - **Property 12: Storage clear operation**
    - **Validates: Requirements 5.1, 5.2, 5.4**
    - File: `src/__tests__/properties/storage.property.test.ts`
    - Use fast-check to generate valid StoredData objects
    - Assert save→load produces deeply equal object; save→clear→load returns null

  - [x] 4.3 Create static data files
    - Create `src/data/redFlags.ts` — list of IRS red flags for nail salon payroll (Vietnamese content) with id, title, description, prevention, severity, relatedToTransition
    - Create `src/data/classificationCriteria.ts` — W-2 vs 1099 classification questions (Vietnamese) with behavioral, financial, relationship categories
    - Create `src/data/featureCards.ts` — landing page feature card configs (4 cards: roadmap, calculator, warnings, classification)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2_

  - [x]\* 4.4 Write property test for classification scoring (Property 14)
    - **Property 14: Classification checklist scoring consistency**
    - **Validates: Requirements 6.2**
    - File: `src/__tests__/properties/classification.property.test.ts`
    - Use fast-check to generate boolean answer sets for classification questions
    - Assert deterministic recommendation: more W2-indicator answers → 'W2', more 1099-indicator answers → '1099'

- [x] 5. Implement state management and hooks
  - [x] 5.1 Implement FlowContext (`src/context/FlowContext.tsx`)
    - Implement `flowReducer` with all FlowAction types: START_FEATURE, ACCEPT_DISCLAIMER, REJECT_DISCLAIMER, SUBMIT_FORM, ANALYSIS_COMPLETE, EDIT_INPUTS, START_OVER, SHOW_DISCLAIMER_PAGE, SHOW_PRIVACY_PAGE
    - Create FlowProvider component wrapping children with FlowContext
    - Initial state: currentStep = 'landing', disclaimerAccepted loaded from localStorage
    - _Requirements: 7.4_

  - [x] 5.2 Implement AppContext (`src/context/AppContext.tsx`)
    - Create global state provider managing: calculatorInput, calculatorResult, comparisonResult, roadmapInput, roadmapResult, classificationAnswers, classificationResult
    - Auto-save to localStorage on state changes
    - Load initial state from localStorage on mount
    - _Requirements: 5.1, 5.2_

  - [x] 5.3 Implement custom hooks
    - Create `src/hooks/useCalculator.ts` — wraps calculateTax and compareW2vs1099, updates AppContext
    - Create `src/hooks/useRoadmap.ts` — wraps generateRoadmap, updates AppContext
    - Create `src/hooks/useLocalStorage.ts` — generic localStorage hook with error handling
    - Create `src/hooks/useFlowNavigation.ts` — exposes flow actions and current step from FlowContext
    - Create `src/hooks/useAnalysisAnimation.ts` — manages animation timing (1.5-3s), fires onComplete
    - _Requirements: 2.9, 5.1, 5.2_

- [x] 6. Implement UI components - Layout and Landing
  - [x] 6.1 Implement layout components
    - Create `src/components/layout/Header.tsx` — minimal header with logo/app title
    - Create `src/components/layout/Footer.tsx` — footer with links to Disclaimer & Privacy Policy pages
    - Create `src/components/layout/MobileMenu.tsx` — hamburger menu for screens < 768px
    - Create `src/components/layout/DisclaimerBanner.tsx` — persistent banner reminding to consult CPA/tax attorney, visible on all flow steps
    - _Requirements: 3.7, 4.1, 4.4, 4.5_

  - [x] 6.2 Implement landing page components
    - Create `src/components/landing/HeroSection.tsx` — intro section with app description (Vietnamese)
    - Create `src/components/landing/FeatureCard.tsx` — individual feature card with icon, title, description, CTA button
    - Create `src/components/landing/LandingPage.tsx` — renders HeroSection + 4 FeatureCards, triggers disclaimer flow on CTA click
    - _Requirements: 4.1, 4.2_

- [x] 7. Implement UI components - Disclaimer, Form, and Animation
  - [x] 7.1 Implement disclaimer components
    - Create `src/components/disclaimer/DisclaimerPopup.tsx` — modal triggered by CTA click, shows disclaimer text, Accept/Reject buttons, saves accepted state to localStorage
    - Create `src/components/disclaimer/DisclaimerPage.tsx` — full disclaimer content (accessible from footer link, rendered as overlay)
    - Create `src/components/disclaimer/PrivacyPolicyPage.tsx` — privacy policy content (no data collection, localStorage only, no third-party sharing)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 7.2 Implement input form components
    - Create `src/components/form/RevenueInput.tsx` — monthly revenue field with validation
    - Create `src/components/form/SplitRatioInput.tsx` — custom split ratio selector (4/6, 5/5, 3/7, custom)
    - Create `src/components/form/WorkerCountInput.tsx` — number of workers field
    - Create `src/components/form/CashPercentInput.tsx` — current cash percentage slider/input (0-100)
    - Create `src/components/form/StateSelector.tsx` — US state dropdown
    - Create `src/components/form/WorkerTypeToggle.tsx` — W-2 / 1099 toggle
    - Create `src/components/form/HoursPerWeekInput.tsx` — hours per week for minimum wage check
    - Create `src/components/form/InputForm.tsx` — unified form composing all input components, inline validation errors, pre-fills from localStorage
    - _Requirements: 2.1, 2.2, 2.11, 2.12, 4.1, 4.2_

  - [x] 7.3 Implement analysis animation
    - Create `src/components/animation/ProgressIndicator.tsx` — step labels: "Đang tính toán thuế...", "Đang tạo lộ trình...", "Đang phân tích rủi ro..."
    - Create `src/components/animation/AnimationGraphics.tsx` — visual animation elements (spinning charts, number counters) using Framer Motion
    - Create `src/components/animation/AnalysisAnimation.tsx` — container that runs calculations during animation, fires onComplete after min 1.5s / max 3s
    - _Requirements: 2.9_

- [x] 8. Implement UI components - Results View
  - [x] 8.1 Implement roadmap results section
    - Create `src/components/results/PhaseCard.tsx` — individual phase card showing target ratio, duration, notes
    - Create `src/components/results/RoadmapSection.tsx` — timeline view of all transition phases
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 8.2 Implement comparison and cost sections
    - Create `src/components/results/TaxBreakdown.tsx` — detailed tax breakdown table
    - Create `src/components/results/CostSummary.tsx` — before/after cost comparison per phase
    - Create `src/components/results/ComparisonSection.tsx` — side-by-side W-2 vs 1099 comparison table
    - _Requirements: 2.3, 2.4, 2.5, 2.7, 2.8_

  - [x] 8.3 Implement warnings section
    - Create `src/components/results/RedFlagCard.tsx` — individual red flag card with severity indicator
    - Create `src/components/results/TipReportingNote.tsx` — tip reporting guidance
    - Create `src/components/results/MinimumWageWarning.tsx` — minimum wage violation alert (W-2 only)
    - Create `src/components/results/WarningsSection.tsx` — container rendering relevant red flags based on user input
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 2.10_

  - [x] 8.4 Implement classification section
    - Create `src/components/classification/ComparisonChart.tsx` — W-2 vs 1099 comparison table
    - Create `src/components/classification/ClassificationChecklist.tsx` — IRS criteria checklist with scoring
    - Create `src/components/classification/SplitModelGuide.tsx` — commission split model explanation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.5 Implement ResultsView container and PDF export
    - Create `src/components/results/PdfExportButton.tsx` — button triggering PDF generation
    - Create `src/utils/pdfExport.ts` — generate PDF with jsPDF containing all results (Vietnamese text), disclaimer footer
    - Create `src/components/results/ResultsView.tsx` — unified results page with 3 sections (Roadmap, Comparison, Warnings), "Chỉnh sửa thông tin" and "Xuất PDF" buttons
    - _Requirements: 5.3, 2.7, 2.8_

- [x] 9. Checkpoint - Ensure all component rendering works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire everything together in App.tsx
  - [x] 10.1 Implement App.tsx with flow routing
    - Create `src/App.tsx` — wrap with FlowProvider and AppProvider, render current flow step based on FlowContext state
    - Render Header, DisclaimerBanner, Footer persistently
    - Conditionally render LandingPage, DisclaimerPopup, InputForm, AnalysisAnimation, or ResultsView based on currentStep
    - Render DisclaimerPage and PrivacyPolicyPage as overlays when triggered from footer
    - Implement responsive layout (mobile hamburger menu < 768px)
    - _Requirements: 4.4, 4.5, 3.7_

  - [x] 10.2 Implement common utility components
    - Create `src/components/common/ConfirmDialog.tsx` — reusable confirmation modal (used for data deletion confirmation)
    - Create `src/components/common/ErrorMessage.tsx` — inline validation error display
    - Create `src/components/common/BackButton.tsx` — navigation back within flow
    - Add "Xóa dữ liệu" button with ConfirmDialog in appropriate location
    - _Requirements: 5.4, 5.5_

  - [x]\* 10.3 Write component integration tests
    - Test flow navigation: landing → disclaimer → form → analyzing → results
    - Test disclaimer persistence (skip popup if already accepted)
    - Test form pre-fill from localStorage
    - Test responsive rendering (mobile menu at < 768px)
    - Test Vietnamese content format ("Vietnamese (English)" pattern)
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 5.2, 7.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (14 properties total)
- Unit tests validate specific examples and edge cases
- All UI text must be in Vietnamese with English terms in parentheses where applicable
- No backend server required — all logic runs client-side
- localStorage is the only persistence mechanism
- No URL routing — flow managed by React state (FlowContext)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.3", "2.5", "2.7"] },
    { "id": 3, "tasks": ["2.2", "2.4", "2.6", "2.8", "4.1", "4.3"] },
    { "id": 4, "tasks": ["4.2", "4.4", "5.1", "5.2"] },
    { "id": 5, "tasks": ["5.3", "6.1", "6.2"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 8, "tasks": ["8.5"] },
    { "id": 9, "tasks": ["10.1", "10.2"] },
    { "id": 10, "tasks": ["10.3"] }
  ]
}
```
