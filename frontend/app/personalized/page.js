"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePersonalized } from "../contexts/PersonalizedContext";
import Logo from "../components/Logo";
import ProgressIndicator from "../components/ProgressIndicator";
import { motion, AnimatePresence } from "framer-motion";

const genres = [
  "Drama",
  "Mystery & Thriller", 
  "Romance",
  "Sci-Fi",
  "Fantasy",
  "Academic",
  "Biography",
  "Comedy",
  "Spirituality",
  "Adventure"
];

const languages = [
  "Hindi",
  "English", 
  "Gujarati",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil"
];

export default function PersonalizedPage() {
  const {
    currentStep,
    nextStep,
    prevStep,
    updatePersonalizedData,
    completePersonalized,
    personalizedData,
  } = usePersonalized();
  const router = useRouter();

  const [authors, setAuthors] = useState(personalizedData?.authors || "");
  const [selectedGenres, setSelectedGenres] = useState(personalizedData?.genres || []);
  const [selectedLanguage, setSelectedLanguage] = useState(personalizedData?.language || "");
  const [direction, setDirection] = useState(0); // 0: initial, 1: next, -1: prev

  const handleSkip = () => {
    if (currentStep === 1) {
      updatePersonalizedData(1, { authors: "" });
      nextStep();
    } else if (currentStep === 2) {
      updatePersonalizedData(2, { genres: [] });
      nextStep();
    } else if (currentStep === 3) {
      updatePersonalizedData(3, { language: "" });
      completePersonalized();
      router.push("/");
    }
  };

  const handleDone = () => {
    updatePersonalizedData(3, { language: selectedLanguage });
    completePersonalized();
    router.push("/");
  };

  const handleNext = () => {
    setDirection(1);
    if (currentStep === 1) {
      updatePersonalizedData(1, { authors });
    } else if (currentStep === 2) {
      updatePersonalizedData(2, { genres: selectedGenres });
    }
    nextStep();
  };

  const handleBack = () => {
    setDirection(-1);
    prevStep();
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    in: {
      x: 0,
      opacity: 1,
    },
    out: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <div className="min-h-screen bg-[#FDF6EB] flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Logo />
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-4 sm:py-8 mb-8 sm:mb-16">
        <div className="text-center w-full sm:w-3/4 max-w-4xl">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <motion.h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                  Who are the authors you enjoy reading the most?
                </motion.h1>
                <motion.p 
                  className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                  Pick your favorites so we can recommend more books you&apos;ll love
                </motion.p>

                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 mb-6 sm:mb-8 px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  <input
                    type="text"
                    placeholder="eg: Roald Dahl, J.K. Rowling"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    className="w-full sm:flex-1 max-w-md border-b-2 border-gray-300 bg-transparent py-3 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#D47249] text-base sm:text-lg"
                  />
                  <motion.button
                    onClick={handleNext}
                    className="w-full sm:w-auto sm:ml-4 bg-[#D47249] text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-[#BF5F3B] transition-colors text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next →
                  </motion.button>
                </motion.div>
                
                {/* Skip button for Step 1 */}
                <motion.div 
                  className="flex justify-end mt-4 sm:mt-6 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={handleSkip}
                    className="text-gray-600 underline hover:text-[#D47249] transition-colors text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Skip
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <motion.h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                  Tell us what kinds of books you enjoy the most?
                </motion.h1>
                <motion.p 
                  className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                  You can change your preferences anytime in your profile
                </motion.p>

                <motion.div 
                  className="flex flex-col items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  {/* First row - 5 genres */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    {genres.slice(0, 5).map((genre, index) => (
                      <motion.button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 transition-all whitespace-nowrap w-fit text-sm sm:text-base ${
                          selectedGenres.includes(genre)
                            ? 'bg-[#D47249] text-white border-[#D47249]'
                            : 'bg-transparent text-gray-700 border-[#D47249] hover:bg-[#D47249] hover:text-white'
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.5 + (index * 0.1), 
                          ease: "easeOut" 
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {genre}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Second row - 5 genres */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    {genres.slice(5, 10).map((genre, index) => (
                      <motion.button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 transition-all whitespace-nowrap w-fit text-sm sm:text-base ${
                          selectedGenres.includes(genre)
                            ? 'bg-[#D47249] text-white border-[#D47249]'
                            : 'bg-transparent text-gray-700 border-[#D47249] hover:bg-[#D47249] hover:text-white'
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 1.0 + (index * 0.1), 
                          ease: "easeOut" 
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {genre}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.button
                  onClick={handleNext}
                  className="w-full sm:w-auto bg-[#D47249] text-white px-8 sm:px-10 py-3 rounded-full font-semibold hover:bg-[#BF5F3B] transition-colors text-base sm:text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next →
                </motion.button>
                
                {/* Navigation for Step 2 */}
                <motion.div 
                  className="flex justify-between items-center mt-4 sm:mt-6 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={handleBack}
                    className="text-gray-600 underline hover:text-[#D47249] transition-colors text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back
                  </motion.button>
                  
                  <motion.button
                    onClick={handleSkip}
                    className="text-gray-600 underline hover:text-[#D47249] transition-colors text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Skip
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <motion.h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                  Which language do you prefer to use?
                </motion.h1>
                <motion.p 
                  className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                  Select your preferred language to personalize your experience and content
                </motion.p>

                <motion.div 
                  className="flex flex-col items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  {/* Mobile Layout: 3-3-1 */}
                  <div className="block sm:hidden">
                    {/* First row - 3 languages */}
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {languages.slice(0, 3).map((language, index) => (
                        <motion.button
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className={`px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap w-fit text-sm ${
                            selectedLanguage === language
                              ? 'bg-[#D47249] text-white border-[#D47249]'
                              : 'bg-transparent text-gray-700 border-[#D47249] hover:bg-[#D47249] hover:text-white'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.5 + (index * 0.1), 
                            ease: "easeOut" 
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Second row - 3 languages */}
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {languages.slice(3, 6).map((language, index) => (
                        <motion.button
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className={`px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap w-fit text-sm ${
                            selectedLanguage === language
                              ? 'bg-[#D47249] text-white border-[#D47249]'
                              : 'bg-transparent text-gray-700 border-[#D47249] hover:bg-[#D47249] hover:text-white'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.8 + (index * 0.1), 
                            ease: "easeOut" 
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Third row - 1 language centered */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {languages.slice(6, 7).map((language, index) => (
                        <motion.button
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className={`px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap w-fit text-sm ${
                            selectedLanguage === language
                              ? 'bg-[#D47249] text-white border-[#D47249]'
                              : 'bg-transparent text-gray-700 border-[#D47249] hover:bg-[#D47249] hover:text-white'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 1.1 + (index * 0.1), 
                            ease: "easeOut" 
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Layout: 4-3 */}
                  <div className="hidden sm:block">
                    {/* First row - 4 languages */}
                    <div className="flex flex-wrap justify-center gap-4 mb-4">
                      {languages.slice(0, 4).map((language, index) => (
                        <motion.button
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className={`px-6 py-3 rounded-full border-2 transition-all whitespace-nowrap w-fit text-base ${
                            selectedLanguage === language
                              ? 'bg-[#D47249] text-white border-[#D47249]'
                              : 'bg-transparent text-gray-700 border-[#D47249] hover:bg-[#D47249] hover:text-white'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.5 + (index * 0.1), 
                            ease: "easeOut" 
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Second row - 3 languages centered */}
                    <div className="flex flex-wrap justify-center gap-4">
                      {languages.slice(4, 7).map((language, index) => (
                        <motion.button
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className={`px-6 py-3 rounded-full border-2 transition-all whitespace-nowrap w-fit text-base ${
                            selectedLanguage === language
                              ? 'bg-[#D47249] text-white border-[#D47249]'
                              : 'bg-transparent text-gray-700 border-[#D47249] hover:bg-[#D47249] hover:text-white'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.9 + (index * 0.1), 
                            ease: "easeOut" 
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={handleDone}
                  disabled={!selectedLanguage}
                  className={`w-full sm:w-auto px-8 sm:px-10 py-3 rounded-full font-semibold transition-colors text-base sm:text-lg ${
                    selectedLanguage
                      ? 'bg-[#D47249] text-white hover:bg-[#BF5F3B]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  whileHover={selectedLanguage ? { scale: 1.05 } : {}}
                  whileTap={selectedLanguage ? { scale: 0.95 } : {}}
                >
                  Done
                </motion.button>
                
                {/* Navigation for Step 3 */}
                <motion.div 
                  className="flex justify-between items-center mt-4 sm:mt-6 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={handleBack}
                    className="text-gray-600 underline hover:text-[#D47249] transition-colors text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back
                  </motion.button>
                  
                  <motion.button
                    onClick={handleSkip}
                    className="text-gray-600 underline hover:text-[#D47249] transition-colors text-base sm:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Skip
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
