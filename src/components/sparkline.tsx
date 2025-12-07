"use client";

import { motion } from 'framer-motion';

interface SparklineProps {
    data: number[];
    color?: string;
    hoverColor?: string;
}

export const Sparkline = ({ data, color = "hsl(var(--primary))", hoverColor }: SparklineProps) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const width = 120;
  const height = 40;
  const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - ((val - min) / (max - min || 1)) * height}`).join(' ');
  
  const finalHoverColor = hoverColor || color;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
         <linearGradient id={`gradient-hover-${finalHoverColor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={finalHoverColor} stopOpacity={0.2} />
          <stop offset="100%" stopColor={finalHoverColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      
      <motion.path 
        d={`M0,${height} L` + points.replace(/ /g, ' L') + ` L${width},${height} Z`} 
        fill={`url(#gradient-${color})`}
        className="transition-all duration-300 group-hover:fill-[url(#gradient-hover-white)]"
        style={{ '--gradient-hover-white': `url(#gradient-hover-${finalHoverColor})` } as any}
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }} 
      />
      <motion.polyline 
        points={points} 
        fill="none" 
        stroke={color} 
        className="transition-all duration-300 group-hover:stroke-white"
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        initial={{ pathLength: 0 }} 
        animate={{ pathLength: 1 }} 
        transition={{ duration: 1.5, ease: "easeOut" }} 
      />
    </svg>
  );
};
