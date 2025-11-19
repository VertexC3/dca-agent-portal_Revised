import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['#8B1F1F', '#6B1515', '#B32F2F', '#D44848', '#E86A6A'];

export default function PrescriptionCharts({ prescriptions }) {
  // Count by drug class
  const drugClassData = React.useMemo(() => {
    const counts = {};
    prescriptions.forEach(p => {
      const drugClass = p.drug_class || 'Unclassified';
      counts[drugClass] = (counts[drugClass] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [prescriptions]);

  // Count by prescriber
  const prescriberData = React.useMemo(() => {
    const counts = {};
    prescriptions.forEach(p => {
      counts[p.prescriber_name] = (counts[p.prescriber_name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [prescriptions]);

  // Status breakdown
  const statusData = React.useMemo(() => {
    const counts = { active: 0, discontinued: 0, completed: 0 };
    prescriptions.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));
  }, [prescriptions]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#8B1F1F]" />
        Prescribing Patterns
      </h3>

      {/* Status Breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Prescription Status</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Drug Class Distribution */}
      {drugClassData.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Medications by Drug Class</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={drugClassData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8B1F1F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Prescribers */}
      {prescriberData.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Prescribers</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={prescriberData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B1F1F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}