"use client";
import React, { createContext, useContext, useState } from 'react';

const PersonalizedContext = createContext();

export function PersonalizedProvider({ children }) {
  const [personalizedData, setPersonalizedData] = useState({
    authors: '',
    genres: [],
    language: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isPersonalizedComplete, setIsPersonalizedComplete] = useState(false);

  const updatePersonalizedData = (step, data) => {
    setPersonalizedData(prev => ({
      ...prev,
      ...data
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const completePersonalized = () => {
    setIsPersonalizedComplete(true);
  };

  const resetPersonalized = () => {
    setPersonalizedData({
      authors: '',
      genres: [],
      language: ''
    });
    setCurrentStep(1);
    setIsPersonalizedComplete(false);
  };

  return (
    <PersonalizedContext.Provider value={{
      personalizedData,
      currentStep,
      isPersonalizedComplete,
      updatePersonalizedData,
      nextStep,
      prevStep,
      completePersonalized,
      resetPersonalized
    }}>
      {children}
    </PersonalizedContext.Provider>
  );
}

export function usePersonalized() {
  const context = useContext(PersonalizedContext);
  if (!context) {
    throw new Error('usePersonalized must be used within a PersonalizedProvider');
  }
  return context;
}