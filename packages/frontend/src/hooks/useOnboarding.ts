"use client";

import { useState, useEffect, useCallback } from "react";

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  stepsCompleted: boolean[];
}

const STORAGE_KEY = "meritcoin-onboarding";
const TOTAL_STEPS = 5;

function defaultState(): OnboardingState {
  return {
    completed: false,
    currentStep: 0,
    stepsCompleted: Array(TOTAL_STEPS).fill(false),
  };
}

function loadState(): OnboardingState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return defaultState();
  }
}

function saveState(state: OnboardingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(defaultState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const markStepDone = useCallback((stepIndex: number) => {
    setState((prev) => {
      if (prev.stepsCompleted[stepIndex]) return prev;
      const stepsCompleted = [...prev.stepsCompleted];
      stepsCompleted[stepIndex] = true;

      const allDone = stepsCompleted.every(Boolean);
      const nextIncomplete = stepsCompleted.findIndex((done) => !done);
      const currentStep = nextIncomplete === -1 ? TOTAL_STEPS - 1 : nextIncomplete;

      const updated: OnboardingState = {
        completed: allDone,
        currentStep,
        stepsCompleted,
      };
      saveState(updated);
      return updated;
    });
  }, []);

  const skipOnboarding = useCallback(() => {
    setState((prev) => {
      const updated: OnboardingState = {
        ...prev,
        completed: true,
      };
      saveState(updated);
      return updated;
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    const fresh = defaultState();
    saveState(fresh);
    setState(fresh);
  }, []);

  return { state, markStepDone, skipOnboarding, resetOnboarding };
}
