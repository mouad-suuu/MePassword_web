'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const CyberPattern = () => {
  const [paths, setPaths] = useState<{ id: number; d: string }[]>([]);

  useEffect(() => {
    const generatePaths = () => {
      const newPaths = [];
      const gridSize = 40;
      const numPaths = 16;
      
      // Define corners
      const corners = [
        { x: 0, y: 0 },       // Top left
        { x: 800, y: 0 },     // Top right
        { x: 0, y: 600 },     // Bottom left
        { x: 800, y: 600 }    // Bottom right
      ];

      for (let i = 0; i < numPaths; i++) {
        // Select random corner
        const corner = corners[Math.floor(Math.random() * corners.length)];
        
        // Start within corner area with more spread
        const offsetX = Math.random() * 150 * (corner.x === 0 ? 1 : -1);
        const offsetY = Math.random() * 150 * (corner.y === 0 ? 1 : -1);
        let path = `M ${corner.x + offsetX} ${corner.y + offsetY}`;
        let currentX = corner.x + offsetX;
        let currentY = corner.y + offsetY;
        const steps = 8 + Math.floor(Math.random() * 4); // More steps

        for (let j = 0; j < steps; j++) {
          const direction = Math.floor(Math.random() * 2);
          // Longer distances for initial movements, shorter for returns
          const distance = gridSize * (j < steps/2 ? 2 + Math.random() : 1 + Math.random());

          if (direction === 0) {
            // Horizontal movement
            // Direction based on starting corner
            const goLeft = j < steps/2 ? 
              (corner.x === 800 ? Math.random() < 0.7 : Math.random() < 0.3) : 
              (corner.x === 800 ? Math.random() < 0.3 : Math.random() < 0.7);
            currentX += distance * (goLeft ? -1 : 1);
            path += ` h ${distance * (goLeft ? -1 : 1)}`;
          } else {
            // Vertical movement
            // Direction based on starting corner
            const goUp = j < steps/2 ? 
              (corner.y === 600 ? Math.random() < 0.7 : Math.random() < 0.3) : 
              (corner.y === 600 ? Math.random() < 0.3 : Math.random() < 0.7);
            currentY += distance * (goUp ? -1 : 1);
            path += ` v ${distance * (goUp ? -1 : 1)}`;
          }
        }

        newPaths.push({ id: i, d: path });
      }
      return newPaths;
    };

    setPaths(generatePaths());
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg
        className="w-full h-full opacity-[0.15] dark:opacity-[0.25] pointer-events-none"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: 'none' }}
      >
        <g style={{ pointerEvents: 'none' }}>
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              style={{ pointerEvents: 'none' }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 1,
                transition: {
                  pathLength: {
                    duration: 5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  },
                  opacity: {
                    duration: 0.5,
                    ease: "easeIn"
                  }
                }
              }}
            />
          ))}
        </g>
        {/* Animated dots */}
        {paths.map((path, index) => (
          <motion.circle
            key={`dot-${path.id}`}
            r="3"
            fill="currentColor"
            style={{ pointerEvents: 'none' }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              transition: {
                duration: 5,
                ease: "linear",
                repeat: Infinity,
                delay: index * 0.3
              }
            }}
          >
            <motion.animate
              dur="5s"
              repeatCount="indefinite"
              path={path.d}
              style={{ pointerEvents: 'none' }}
            />
          </motion.circle>
        ))}
      </svg>
    </div>
  );
};
