import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertTriangle, CheckCircle2, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  LABEL_CREATED:      { label: 'Label Created',       color: 'bg-gray-100 text-gray-700',    icon: Package },
  IN_TRANSIT:         { label: 'In Transit',           color: 'bg-blue-100 text-blue-700',    icon: Truck },
  AT_LOCAL_FACILITY:  { label: 'At Local Facility',    color: 'bg-indigo-100 text-indigo-700',icon: Truck },
  OUT_FOR_DELIVERY:   { label: 'Out for Delivery',     color: 'bg-yellow-100 text-yellow-800',icon: Truck },
  DELIVERED:          { label: 'Delivered',            color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  EXCEPTION:          { label: 'Exception',            color: 'bg-red-100 text-red-700',      icon: AlertTriangle },
};

export default function ShipmentStatusHeader({ shipment }) {
  const cfg = STATUS_CONFIG[shipment.statusCode] || STATUS_CONFIG.IN_TRANSIT;
  const Icon = cfg.icon;

  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${cfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{shipment.carrier}</span>
            <Badge className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</Badge>
            {shipment.exceptionMessage && (
              <Badge className="text-xs bg-red-100 text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />{shipment.exceptionMessage}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Tracking: <span className="font-semibold text-gray-700">{shipment.trackingNumber}</span>
          </p>
          {shipment.lastEventAt && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {format(new Date(shipment.lastEventAt), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>
      </div>

      {shipment.estimatedDeliveryWindow && (
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500">Est. Delivery</p>
          <p className="text-xs font-bold text-gray-800">
            {format(new Date(shipment.estimatedDeliveryWindow.begins), 'MMM d')}
          </p>
          {shipment.estimatedDeliveryWindow.window && (
            <p className="text-xs text-gray-500">{shipment.estimatedDeliveryWindow.window}</p>
          )}
        </div>
      )}
    </div>
  );
}