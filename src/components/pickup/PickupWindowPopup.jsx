import React, { useState } from 'react';
import { X, Clock, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const trafficData = [
  { time: '9AM', traffic: 30, label: '9:00 AM' },
  { time: '10AM', traffic: 45, label: '10:00 AM' },
  { time: '11AM', traffic: 70, label: '11:00 AM' },
  { time: '12PM', traffic: 85, label: '12:00 PM' },
  { time: '1PM', traffic: 90, label: '1:00 PM' },
  { time: '2PM', traffic: 65, label: '2:00 PM' },
  { time: '3PM', traffic: 50, label: '3:00 PM' },
  { time: '4PM', traffic: 40, label: '4:00 PM' },
  { time: '5PM', traffic: 60, label: '5:00 PM' },
];

export default function PickupWindowPopup({ open, onClose }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirmPickup = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 2000);
  };

  const getBarColor = (traffic) => {
    if (traffic < 50) return '#22c55e'; // green - low traffic
    if (traffic < 75) return '#eab308'; // yellow - medium traffic
    return '#ef4444'; // red - high traffic
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const traffic = payload[0].value;
      const level = traffic < 50 ? 'Low' : traffic < 75 ? 'Medium' : 'High';
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].payload.label}</p>
          <p className="text-sm text-gray-600">Traffic: {level}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#8B1F1F]" />
            Pickup Window
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Ready Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-900">Your Order is Ready!</h3>
                <p className="text-sm text-green-700">Order #12345 - 3 prescriptions</p>
              </div>
            </div>
          </motion.div>

          {/* Pickup Time Frame */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Available Pickup Hours</h4>
            </div>
            <p className="text-2xl font-bold text-blue-900">9:00 AM - 5:00 PM</p>
            <p className="text-sm text-blue-700 mt-1">Monday through Friday</p>
          </div>

          {/* Traffic Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Best Time to Pick Up</h4>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-600">High</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    label={{ value: 'Traffic', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="traffic" radius={[8, 8, 0, 0]}>
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.traffic)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span>
                  <strong className="text-green-700">Best times:</strong> 9-10 AM, 3-4 PM (Low traffic)
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Button */}
          <div className="pt-4 border-t border-gray-200">
            {confirmed ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmed! We'll have your order ready at the counter.
              </motion.div>
            ) : (
              <Button
                onClick={handleConfirmPickup}
                className="w-full h-12 bg-[#8B1F1F] hover:bg-[#721919] text-white text-lg font-semibold"
              >
                I'm Here to Pick Up
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}