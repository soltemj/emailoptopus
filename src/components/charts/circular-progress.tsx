import React from 'react';

interface CircularProgressProps {
  percentage: number;
  title: string;
  value: string;
  color: string;
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  title,
  value,
  color,
  size = 120
}) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {percentage}%
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {value}
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
    </div>
  );
};