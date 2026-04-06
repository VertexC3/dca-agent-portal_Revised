import React from 'react';
import { CheckCircle2, User, Camera, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ProofOfDeliverySection({ pod }) {
  if (!pod) return null;

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Proof of Delivery</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {pod.deliveredAt && (
          <div>
            <p className="text-gray-500">Delivered At</p>
            <p className="font-semibold text-gray-800">{format(new Date(pod.deliveredAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
        )}
        {pod.signedBy && (
          <div>
            <p className="text-gray-500">Received By</p>
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <User className="w-3 h-3" />{pod.signedBy}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {pod.gpsAvailable && (
          <Badge className="text-xs bg-green-100 text-green-700 flex items-center gap-1">
            <MapPin className="w-3 h-3" />GPS Confirmed
          </Badge>
        )}
        {pod.photoUrl && (
          <Badge className="text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
            <Camera className="w-3 h-3" />Photo Available
          </Badge>
        )}
        {!pod.gpsAvailable && !pod.photoUrl && (
          <Badge className="text-xs bg-gray-100 text-gray-600">Standard Delivery Confirmation</Badge>
        )}
      </div>

      {pod.photoUrl && (
        <img src={pod.photoUrl} alt="Proof of delivery" className="w-full rounded-lg border border-green-200 mt-1" />
      )}
    </div>
  );
}