import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, X } from "lucide-react";
import { motion } from "framer-motion";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function FlashcardDeck({ flashcards, onClose }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-base-panel border border-border-glass rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold text-text-primary">AI Flashcards</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-text-muted bg-base-raised px-3 py-1 rounded-full">
              {currentIndex + 1} / {flashcards.length}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-base-raised rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Card Area (3D Flip) */}
        <div 
          className="w-full h-80 relative perspective-1000 cursor-pointer"
          onClick={handleFlip}
        >
          <motion.div
            className="w-full h-full relative preserve-3d transition-transform duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Front (Question) */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-accent-blue/10 to-accent-peach/10 border-2 border-accent-blue/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg">
              <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-accent-blue">Question</span>
              <p className="text-2xl font-medium text-text-primary leading-relaxed">
                {currentCard.question}
              </p>
              <div className="absolute bottom-4 flex items-center gap-2 text-text-muted text-sm opacity-50">
                <RotateCw size={14} /> Click to flip
              </div>
            </div>

            {/* Back (Answer) */}
            <div 
              className="absolute inset-0 backface-hidden bg-gradient-to-br from-accent-peach/10 to-accent-orange/10 border-2 border-accent-peach/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg"
              style={{ transform: "rotateY(180deg)" }}
            >
               <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-accent-peach">Answer</span>
               <p className="text-xl text-text-primary leading-relaxed">
                {currentCard.answer}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-8">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-base-raised border border-border-glass text-text-primary hover:bg-accent-blue hover:text-white hover:border-accent-blue transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-base-raised border border-border-glass text-text-primary hover:bg-accent-blue hover:text-white hover:border-accent-blue transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
