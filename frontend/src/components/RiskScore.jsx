import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const RiskScore = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1000; // 1 second count-up
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(Math.floor(easeProgress * score));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [score]);

  let color = '#10B981'; // Green
  let label = 'Low Risk';
  if (score >= 70) {
    color = '#EF4444'; // Red
    label = 'High Risk';
  } else if (score >= 30) {
    color = '#F59E0B'; // Amber
    label = 'Moderate Risk';
  }

  const data = [{ name: 'Risk', value: animatedScore, fill: color }];

  return (
    <div className="bg-[#1A1D27] rounded-xl p-6 border border-[#252936] flex flex-col items-center justify-center relative">
      <h3 className="text-white font-semibold mb-4 self-start">Patient Risk Score</h3>
      <div className="w-full h-[200px] relative flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="50%" 
            innerRadius="70%" outerRadius="100%" 
            barSize={15} 
            data={data}
            startAngle={180} endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: '#252936' }}
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center top-[40%]">
          <span className="text-4xl font-bold text-white">{animatedScore}</span>
          <span className="text-xs font-medium mt-1" style={{ color }}>{label}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskScore;
