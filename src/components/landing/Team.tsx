"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { RadialIntro } from "@/components/animate-ui/components/community/radial-intro";
import { Quote } from "lucide-react";

const team = [
  {
    id: 1,
    name: "Mohammed Afeef",
    role: "Backend Wizard",
    quote: "Can optimize your API and finish a biriyani faster than you blink.",
    initials: "MA",
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=MohammedAfeef",
  },
  {
    id: 2,
    name: "Divyaprakash",
    role: "ML Architect",
    quote: "Trains models while training for marathons. Both finish at 99.9% accuracy.",
    initials: "DP",
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Divyaprakash",
  },
  {
    id: 3,
    name: "Abdul Rahuman Sudais",
    role: "Frontend Ninja",
    quote: "Writes CSS animations smoother than butter and debugs with eyes closed.",
    initials: "ARS",
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=AbdulRahuman",
  },
  {
    id: 4,
    name: "Dhanusree",
    role: "Audio Engineer",
    quote: "Can hear a bug in production from three offices away. Literally.",
    initials: "DH",
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhanusree",
  },
  {
    id: 5,
    name: "Rakkesh",
    role: "DevOps Master",
    quote: "Deploys at 3 AM like it's a casual Tuesday. Sleep is for the weak.",
    initials: "RK",
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rakkesh",
  },
  {
    id: 6,
    name: "Jhai Praneesh",
    role: "Product Designer",
    quote: "Designs interfaces so intuitive, even your grandma could use them blindfolded.",
    initials: "JP",
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=JhaiPraneesh",
  },
];

export function Team() {
  const [selectedMember, setSelectedMember] = useState(team[0]);
  const [stageSize, setStageSize] = useState(450);
  const [imageSize, setImageSize] = useState(85);

  useEffect(() => {
    const updateSizes = () => {
      if (window.innerWidth < 640) {
        setStageSize(280);
        setImageSize(50);
      } else if (window.innerWidth < 1024) {
        setStageSize(350);
        setImageSize(65);
      } else {
        setStageSize(450);
        setImageSize(85);
      }
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

  const handleMemberClick = (item: { id: number; name: string; src?: string; initials?: string }) => {
    const member = team.find((m) => m.id === item.id);
    if (member) {
      setSelectedMember(member);
    }
  };

  const orbitItems = team.map((member) => ({
    id: member.id,
    name: member.name,
    src: member.src,
    initials: member.initials,
  }));

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-6"
          >
            <motion.span
              className="text-sm md:text-base font-semibold text-accent uppercase tracking-wider"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Our Team
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
          >
            Meet the <span className="gradient-text">Dream Team</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            The brilliant minds behind ALM-Asia
          </motion.p>
        </div>

        {/* Main content: Radial intro on left, Info box on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left: Radial Intro */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[500px]"
          >
            <RadialIntro
              orbitItems={orbitItems}
              onItemClick={handleMemberClick}
              selectedId={selectedMember.id}
              stageSize={stageSize}
              imageSize={imageSize}
            />
          </motion.div>

          {/* Right: Info Box */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMember.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <Card className="glass-strong p-5 sm:p-6 md:p-8 lg:p-10 border border-accent/20 hover:border-accent/40 transition-all duration-500 relative overflow-hidden">
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100"
                    animate={{
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Name and Role */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">
                        {selectedMember.name}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl text-accent font-semibold mb-6 sm:mb-8">
                        {selectedMember.role}
                      </p>
                    </motion.div>

                    {/* Quote */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <Quote className="absolute -top-2 -left-2 h-6 w-6 sm:h-8 sm:w-8 text-accent/30" />
                      <blockquote className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed italic pl-5 sm:pl-6 border-l-2 border-accent/30">
                        "{selectedMember.quote}"
                      </blockquote>
                    </motion.div>

                    {/* Decorative elements */}
                    <motion.div
                      className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-accent/5 blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
