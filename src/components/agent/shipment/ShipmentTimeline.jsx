import React from 'react';
import { format } from 'date-fns';
import { Truck, MapPin, Package, CheckCircle2, AlertTriangle, Home } from 'lucide-react';

const EVENT_ICONS = {
  in_transit:       { icon: Truck,         color: 'text-blue-600 bg-blue-50 border-blue-200' },
  local_facility:   { icon: MapPin,         color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  out_for_delivery: { icon: Truck,          color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  delivered:        { icon: CheckCircle2,   color: 'text-green-600 bg-green-50 border-green-200' },
  exception:        { icon: AlertTriangle,  color: 'text-red-600 bg-red-50 border-red-200' },
  label_created:    { icon: Package,        color: 'text-gray-500 bg-gray-50 border-gray-200' },
  pickup:           { icon: Home,           color: 'text-purple-600 bg-purple-50 border-purple-200' },
};

export default function ShipmentTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
        No tracking events yet — awaiting first carrier scan
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const cfg = EVENT_ICONS[event.type] || EVENT_ICONS.in_transit;
        const Icon = cfg.icon;
        const isFirst = i === 0;
        const isLast = i === events.length - 1;

        return (
          <div key={i} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ${cfg.color} ${isFirst ? 'ring-2 ring-offset-1 ring-gray-300' : ''}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>

            {/* Event content */}
            <div className={`pb-4 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-xs font-semibold ${isFirst ? 'text-gray-900' : 'text-gray-700'} ${event.isException ? 'text-red-700' : ''}`}>
                  {event.label}
                </p>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
              {event.locationText && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />{event.locationText}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}