/**
 * App — application root and single-page flow router.
 *
 * Wraps the tree in {@link FlowProvider} and {@link AppProvider}, then renders
 * the current flow step (landing → disclaimer → form → analyzing → results)
 * based on {@link FlowContext} state — there is no URL routing.
 *
 * Persistent chrome ({@link Header}, {@link DisclaimerBanner}, {@link Footer})
 * is always visible. The Disclaimer and Privacy Policy pages render as overlays
 * on top of any step when triggered from the footer / mobile menu.
 *
 * Wiring notes:
 * - On `SUBMIT_FORM` the validated {@link TaxInput} is held locally, the flow
 *   advances to `analyzing`, and {@link AnalysisAnimation} runs the calculator
 *   and roadmap generator behind the animation (storing results in
 *   {@link AppContext}). When the animation completes, the flow advances to
 *   `results`.
 * - {@link ResultsView} reads its data from {@link AppContext}; if results are
 *   not yet available it degrades gracefully by returning to the form.
 *
 * @see design.md — "Data Flow", "Flow State Management", "App.tsx"
 * @see requirements.md — Requirements 3.7, 4.4, 4.5
 */

import { useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import { FlowProvider } from "./context/FlowContext";
import { AppProvider } from "./context/AppContext";
import type { RoadmapInput, TaxInput } from "./context/types";
import { useFlowNavigation } from "./hooks/useFlowNavigation";
import { useCalculator } from "./hooks/useCalculator";
import { useRoadmap } from "./hooks/useRoadmap";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import DisclaimerBanner from "./components/layout/DisclaimerBanner";
import LandingPage from "./components/landing/LandingPage";
import DisclaimerPopup from "./components/disclaimer/DisclaimerPopup";
import DisclaimerPage from "./components/disclaimer/DisclaimerPage";
import PrivacyPolicyPage from "./components/disclaimer/PrivacyPolicyPage";
import InputForm from "./components/form/InputForm";
import AnalysisAnimation from "./components/animation/AnalysisAnimation";
import ResultsView from "./components/results/ResultsView";

/** Derive the roadmap generator input from a calculator {@link TaxInput}. */
function toRoadmapInput(input: TaxInput): RoadmapInput {
  return {
    currentCashPercent: input.currentCashPercent,
    splitRatio: input.splitRatio,
    workerType: input.workerType,
    monthlyRevenue: input.monthlyRevenue,
    numberOfWorkers: input.numberOfWorkers,
    state: input.state,
    numberOfPhases: input.numberOfPhases,
  };
}

/**
 * Inner application content. Lives inside the providers so it can consume the
 * flow and app contexts.
 */
function AppContent() {
  const {
    currentStep,
    showDisclaimerPage,
    showPrivacyPage,
    acceptDisclaimer,
    rejectDisclaimer,
    submitForm,
    completeAnalysis,
    editInputs,
    startOver,
  } = useFlowNavigation();

  const {
    result: taxResult,
    comparison: comparisonResult,
    calculate,
    input: persistedInput,
  } = useCalculator();
  const { roadmap, generate: generateRoadmap } = useRoadmap();

  // The validated input submitted from the form. Held so the calculations can
  // run behind the analysis animation rather than blocking the submit handler.
  const pendingInputRef = useRef<TaxInput | null>(null);

  const handleSubmitForm = useCallback(
    (input: TaxInput) => {
      pendingInputRef.current = input;
      submitForm();
    },
    [submitForm],
  );

  // Run the (synchronous) calculations once, behind the animation.
  const runCalculations = useCallback(() => {
    const input = pendingInputRef.current;
    if (!input) return;
    calculate(input);
    generateRoadmap(toRoadmapInput(input));
  }, [calculate, generateRoadmap]);

  // The input that produced the currently-stored results. Prefer the freshly
  // submitted input, falling back to the persisted calculator input.
  const resultsInput = pendingInputRef.current ?? persistedInput;

  function renderStep() {
    switch (currentStep) {
      case "landing":
        return <LandingPage />;

      case "disclaimer":
        return (
          <>
            <LandingPage />
            <DisclaimerPopup
              isVisible
              onAccept={acceptDisclaimer}
              onReject={rejectDisclaimer}
            />
          </>
        );

      case "form":
        return <InputForm onSubmit={handleSubmitForm} onBack={startOver} />;

      case "analyzing":
        return (
          <AnimatePresence>
            <AnalysisAnimation
              isActive
              onComplete={completeAnalysis}
              runCalculations={runCalculations}
            />
          </AnimatePresence>
        );

      case "results":
        // Guard against missing results (e.g. landing on this step without
        // having run the calculations). Send the user back to the form.
        if (!taxResult || !comparisonResult || !roadmap || !resultsInput) {
          return <InputForm onSubmit={handleSubmitForm} onBack={startOver} />;
        }
        return (
          <ResultsView
            taxResult={taxResult}
            comparisonResult={comparisonResult}
            roadmap={roadmap}
            input={resultsInput}
            onEditInputs={editInputs}
            onStartOver={startOver}
          />
        );

      default:
        return <LandingPage />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Header />
      <DisclaimerBanner />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {renderStep()}
      </main>

      <Footer />

      {/* Footer-triggered legal overlays, available on any step. */}
      {showDisclaimerPage && <DisclaimerPage />}
      {showPrivacyPage && <PrivacyPolicyPage />}
    </div>
  );
}

/** Application root: composes the providers around the flow content. */
function App() {
  return (
    <FlowProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </FlowProvider>
  );
}

export default App;
