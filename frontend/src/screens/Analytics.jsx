import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { getAnalytics } from '../api';

const COLORS = {
  red: '#DC2626',
  amber: '#D97706',
  green: '#059669'
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const result = await getAnalytics();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#E5E7EB] border-t-[#0D9488] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#111827] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            MongoDB Analytics
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">Live aggregations from the MongoDB database</p>
        </div>
        

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Donut Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6"
        >
          <h2 className="text-lg font-medium text-[#111827] mb-6 border-b border-[#E5E7EB] pb-2">Patients by Risk Level</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.riskLevels}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.riskLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }}
                  itemStyle={{ color: '#111827' }}
                />
                <Legend formatter={(value) => <span className="capitalize text-[#374151]">{value} Risk</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Conditions Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6"
        >
          <h2 className="text-lg font-medium text-[#111827] mb-6 border-b border-[#E5E7EB] pb-2">Top 5 Conditions</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topConditions} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.03)'}}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]}>
                  {data.topConditions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0D9488' : '#5EEAD4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Age Groups Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-medium text-[#111827] mb-6 border-b border-[#E5E7EB] pb-2">Patient Demographics (Age Groups)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.ageGroups} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }}
                />
                <Area type="monotone" dataKey="count" stroke="#0D9488" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Analytics;
