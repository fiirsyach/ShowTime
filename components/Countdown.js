'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 md:gap-4">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className="relative overflow-hidden">
            <div className="glass px-4 md:px-6 py-3 md:py-4 rounded-xl min-w-[65px] md:min-w-[80px] bg-white/5 backdrop-blur-lg border border-white/10">
              <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-gradient font-mono">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider mt-1">
                {unit.label}
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </div>
          {index < timeUnits.length - 1 && (
            <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-white/20 font-bold text-xl">
              :
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Countdown;