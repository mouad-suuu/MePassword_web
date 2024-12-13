'use client';

import { useState, useRef, useEffect, TouchEvent } from 'react';
import WindowsHelloCard from '../features/WindowsHelloCard';
import EncryptionCard from '../features/EncryptionCard';
import ZeroKnowledgeCard from '../features/ZeroKnowledgeCard';
import PasswordGenCard from '../features/PasswordGenCard';
import BrowserIntegrationCard from '../features/BrowserIntegrationCard';
import BackupRecoveryCard from '../features/BackupRecoveryCard';

const features = [
  { Component: WindowsHelloCard },
  { Component: EncryptionCard },
  { Component: ZeroKnowledgeCard },
  { Component: PasswordGenCard },
  { Component: BrowserIntegrationCard },
  { Component: BackupRecoveryCard },
];

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % features.length);
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current - 1 + features.length) % features.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    autoPlayRef.current = setInterval(nextSlide, 16000);
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Technical Features
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Understanding the security and technology behind MePassword
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg 
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Previous feature"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg 
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Next feature"
          >
            →
          </button>

          {/* Cards Container */}
          <div 
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="max-w-6xl mx-auto">
                    <feature.Component />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeIndex === index
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
