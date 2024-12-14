'use client';

import { useState, useRef, MouseEvent } from 'react';

interface Feature {
  text: string;
  icon: JSX.Element;
}

interface FeatureCardProps {
  title: string;
  description: string;
  features: (string | Feature)[];
  icon: JSX.Element;
}

export default function FeatureCard({ title, description, features, icon }: FeatureCardProps) {
  const [transform, setTransform] = useState('');
  const [shadow, setShadow] = useState('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Reversed the rotation direction by removing the negative sign from rotateY
    // and adding it to rotateX
    const rotateX = -(y - centerY) / 120;
    const rotateY = (x - centerX) / 120;

    // Calculate shadow position based on tilt
    const shadowX = rotateY * 2;
    const shadowY = -rotateX * 2;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.005)`);
    setShadow(`
      ${shadowX}px ${shadowY}px 15px rgba(255,255,0,0.2),
      ${shadowX}px ${shadowY}px 30px rgba(147,51,234,0.2),
      ${shadowX}px ${shadowY}px 30px rgba(207,21,214,0.2),
      0 4px 6px -1px rgba(0, 0, 0, 0.1)
    `);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setShadow('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
  };

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full relative"
      style={{
        transform,
        boxShadow: shadow,
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative flex flex-col h-full">
        <div className="text-5xl text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
        <ul className="list-none text-gray-600 space-y-3 mt-auto">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              {typeof feature === 'string' ? (
                feature
              ) : (
                <>
                  {feature.icon}
                  <span>{feature.text}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
