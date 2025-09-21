"use client";
import { motion } from "framer-motion";

export default function ProgressIndicator({ currentStep }) {
  const getIndicatorProps = (step) => {
    const isCurrent = step === currentStep;
    const isCompleted = step < currentStep;
    
    return {
      width: isCurrent ? 128 : 64,
      height: 2, // All indicators have the same height
      color: isCompleted || isCurrent ? "#D47249" : "#9CA3AF"
    };
  };

  return (
    <div className="flex justify-center mt-4">
      <div className="flex space-x-3">
        {[1, 2, 3].map((step) => {
          const props = getIndicatorProps(step);
          return (
            <motion.div
              key={step}
              className="rounded-full"
              style={{
                backgroundColor: props.color,
                height: `${props.height * 4}px` // Convert to rem (h-1 = 4px, h-2 = 8px)
              }}
              animate={{ 
                width: props.width,
                backgroundColor: props.color
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          );
        })}
      </div>
    </div>
  );
}
