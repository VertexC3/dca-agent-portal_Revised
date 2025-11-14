import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play } from 'lucide-react';

export default function VideoExplainerDialog({ open, onClose, prescription }) {
  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-[#8B1F1F]" />
            Video Explainer: {prescription.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            {/* Dummy video placeholder */}
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-75" />
              <p className="text-lg font-semibold">Video Explainer for {prescription.name}</p>
              <p className="text-sm opacity-75 mt-2">This is a placeholder for the video content</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">What You'll Learn:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>How to take {prescription.name} properly</li>
              <li>Best time of day for this medication</li>
              <li>Common side effects to watch for</li>
              <li>Drug interactions to avoid</li>
              <li>Storage instructions</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Always follow your doctor's instructions. If you have questions about this medication, 
              contact your pharmacist or healthcare provider.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}