"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface OrbitItem {
  id: number;
  name: string;
  src?: string;
  initials?: string;
}

interface RadialIntroProps {
  orbitItems: OrbitItem[];
  stageSize?: number;
  imageSize?: number;
  onItemClick?: (item: OrbitItem) => void;
  selectedId?: number;
  className?: string;
}

export function RadialIntro({
  orbitItems,
  stageSize = 320,
  imageSize = 60,
  onItemClick,
  selectedId,
  className,
}: RadialIntroProps) {
  const radius = stageSize * 0.42; // Increased distance from center
  const centerX = stageSize / 2;
  const centerY = stageSize / 2;
  const angleStep = (2 * Math.PI) / orbitItems.length;

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <div 
        className="relative mx-auto"
        style={{ width: stageSize, height: stageSize }}
      >
        {/* Center circle - properly centered */}
        <motion.div
          className="absolute rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40 flex items-center justify-center z-10"
          style={{ 
            width: imageSize * 1.5, 
            height: imageSize * 1.5,
            left: centerX - (imageSize * 1.5) / 2,
            top: centerY - (imageSize * 1.5) / 2,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div 
            className="rounded-full bg-accent/20 flex items-center justify-center"
            style={{ width: imageSize * 1.0, height: imageSize * 1.0 }}
          >
            <div 
              className="rounded-full bg-accent pulse-glow"
              style={{ width: imageSize * 0.5, height: imageSize * 0.5 }}
            />
          </div>
        </motion.div>

        {/* Rotating container for orbital animation */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: `${centerX}px ${centerY}px`,
          }}
        >
          {/* Connecting lines from center to each item */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: stageSize, height: stageSize }}
          >
            {orbitItems.map((item, index) => {
              const baseAngle = index * angleStep - Math.PI / 2;
              const x = centerX + radius * Math.cos(baseAngle);
              const y = centerY + radius * Math.sin(baseAngle);

              return (
                <motion.line
                  key={`line-${item.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="hsl(var(--accent))"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{
                    pathLength: { duration: 1, delay: index * 0.1, ease: "easeOut" },
                    opacity: { duration: 0.5, delay: index * 0.1 },
                  }}
                />
              );
            })}
          </svg>

          {/* Orbiting items */}
          {orbitItems.map((item, index) => {
            const baseAngle = index * angleStep - Math.PI / 2;
            const isSelected = selectedId === item.id;
            const x = centerX + radius * Math.cos(baseAngle);
            const y = centerY + radius * Math.sin(baseAngle);

            return (
              <OrbitItem
                key={item.id}
                item={item}
                x={x - imageSize / 2}
                y={y - imageSize / 2}
                imageSize={imageSize}
                index={index}
                isSelected={isSelected}
                onItemClick={onItemClick}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

function OrbitItem({
  item,
  x,
  y,
  imageSize,
  index,
  isSelected,
  onItemClick,
}: {
  item: OrbitItem;
  x: number;
  y: number;
  imageSize: number;
  index: number;
  isSelected: boolean;
  onItemClick?: (item: OrbitItem) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.15 : isHovered ? 1.1 : 1,
      }}
      transition={{
        opacity: { duration: 0.6, delay: index * 0.1 },
        scale: { duration: 0.3 },
      }}
      whileHover={{ scale: 1.2, zIndex: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onItemClick?.(item)}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-accent/30 blur-xl -z-10"
        animate={{
          opacity: isSelected ? [0.5, 0.8, 0.5] : isHovered ? 0.3 : 0,
          scale: isSelected ? [1, 1.3, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isSelected ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Avatar - counter-rotated to stay straight */}
      <div className="relative">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "center center" }}
        >
          <Avatar 
            className="border-2 border-accent/50 group-hover:border-accent transition-all duration-300 shadow-lg shadow-accent/20"
            style={{ width: imageSize * 1.2, height: imageSize * 1.2 }}
          >
            {item.src ? (
              <AvatarImage src={item.src} alt={item.name} />
            ) : null}
            <AvatarFallback 
              className="bg-accent/20 text-accent font-semibold"
              style={{ fontSize: imageSize * 0.5 }}
            >
              {item.initials || item.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        {/* Pulse ring */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent -z-10"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </div>

      {/* Name tooltip - counter-rotated to stay straight */}
      <motion.div
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
        initial={{ opacity: 0, y: -5 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          y: isHovered ? 0 : -5,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "center center" }}
        >
          <div className="glass-strong px-3 py-1 rounded-lg text-sm font-medium">
            {item.name}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
