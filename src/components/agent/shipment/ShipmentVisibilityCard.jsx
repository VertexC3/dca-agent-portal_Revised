import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Satellite } from 'lucide-react';
import ShipmentStatusHeader from './ShipmentStatusHeader';
import ShipmentMap from './ShipmentMap';
import ShipmentTimeline from './ShipmentTimeline';
import ProofOfDeliverySection from './ProofOfDeliverySection';

// Mock shipment data per tracking number
const MOCK_SHIPMENTS = {
  '144RCQ7IMNAA1': {
    carrier: 'FedEx',
    trackingNumber: '144RCQ7IMNAA1',
    statusCode: 'DELIVERED',
    statusLabel: 'Delivered',
    lastEventAt: '2026-01-17T14:14:00',
    location: { mode: 'exact', lat: 35.9251, lng: -86.8689, label: '123 Main St, Franklin, TN 37064' },
    proofOfDelivery: {
      deliveredAt: '2026-01-17T14:14:00',
      signedBy: 'J. DOE',
      gpsAvailable: true,
      photoUrl: null,
    },
    events: [
      { type: 'delivered', label: 'Delivered', timestamp: '2026-01-17T14:14:00', locationText: '123 Main St, Franklin, TN 37064' },
      { type: 'out_for_delivery', label: 'On FedEx vehicle for delivery', timestamp: '2026-01-17T08:03:00', locationText: 'Franklin, TN' },
      { type: 'local_facility', label: 'At local FedEx facility', timestamp: '2026-01-17T05:22:00', locationText: 'Franklin, TN 37064' },
      { type: 'in_transit', label: 'Departed FedEx hub', timestamp: '2026-01-16T22:10:00', locationText: 'Memphis, TN' },
      { type: 'in_transit', label: 'Arrived at FedEx hub', timestamp: '2026-01-16T18:45:00', locationText: 'Memphis, TN' },
      { type: 'in_transit', label: 'In transit', timestamp: '2026-01-16T09:30:00', locationText: 'Atlanta, GA' },
      { type: 'pickup', label: 'Picked up by FedEx', timestamp: '2026-01-15T16:00:00', locationText: 'Warehouse — Scottsdale, AZ' },
      { type: 'label_created', label: 'Shipment label created', timestamp: '2026-01-15T12:00:00', locationText: null },
    ],
  },
  '144RCQ7IMNAA2': {
    carrier: 'FedEx',
    trackingNumber: '144RCQ7IMNAA2',
    statusCode: 'OUT_FOR_DELIVERY',
    statusLabel: 'Out for Delivery',
    lastEventAt: '2026-04-08T08:15:00',
    estimatedDeliveryWindow: { begins: '2026-04-08', window: '10:00 AM – 2:00 PM' },
    location: { mode: 'approximate', lat: 36.1627, lng: -86.7816, label: 'Nashville, TN area', source: 'carrier_scan_city' },
    events: [
      { type: 'out_for_delivery', label: 'On FedEx vehicle for delivery', timestamp: '2026-04-08T08:15:00', locationText: 'Nashville, TN' },
      { type: 'local_facility', label: 'At local FedEx facility', timestamp: '2026-04-08T05:40:00', locationText: 'Nashville, TN 37203' },
      { type: 'in_transit', label: 'Departed FedEx hub', timestamp: '2026-04-07T23:55:00', locationText: 'Memphis, TN' },
      { type: 'in_transit', label: 'In transit', timestamp: '2026-04-07T14:00:00', locationText: 'Louisville, KY' },
      { type: 'pickup', label: 'Picked up by FedEx', timestamp: '2026-04-05T15:30:00', locationText: 'Warehouse — Phoenix, AZ' },
      { type: 'label_created', label: 'Shipment label created', timestamp: '2026-04-05T10:00:00', locationText: null },
    ],
  },
  '144RCQ7IMNAA3': {
    carrier: 'FedEx',
    trackingNumber: '144RCQ7IMNAA3',
    statusCode: 'DELIVERED',
    statusLabel: 'Delivered',
    lastEventAt: '2025-12-22T11:47:00',
    location: { mode: 'exact', lat: 35.9251, lng: -86.8689, label: '123 Main St, Franklin, TN 37064' },
    proofOfDelivery: {
      deliveredAt: '2025-12-22T11:47:00',
      signedBy: 'J. DOE',
      gpsAvailable: true,
    },
    events: [
      { type: 'delivered', label: 'Delivered', timestamp: '2025-12-22T11:47:00', locationText: '123 Main St, Franklin, TN 37064' },
      { type: 'out_for_delivery', label: 'On FedEx vehicle for delivery', timestamp: '2025-12-22T07:55:00', locationText: 'Franklin, TN' },
      { type: 'local_facility', label: 'At local FedEx facility', timestamp: '2025-12-22T04:30:00', locationText: 'Franklin, TN 37064' },
      { type: 'in_transit', label: 'Departed FedEx hub', timestamp: '2025-12-21T21:00:00', locationText: 'Memphis, TN' },
      { type: 'label_created', label: 'Shipment label created', timestamp: '2025-12-20T11:00:00', locationText: null },
    ],
  },
  '144RCQ7IMNAA4': {
    carrier: 'FedEx',
    trackingNumber: '144RCQ7IMNAA4',
    statusCode: 'IN_TRANSIT',
    statusLabel: 'In Transit',
    lastEventAt: '2026-01-21T10:22:00',
    estimatedDeliveryWindow: { begins: '2026-01-23', window: 'By end of day' },
    location: { mode: 'approximate', lat: 36.8529, lng: -83.9188, label: 'Corbin, KY — FedEx Sort Facility', source: 'fedex_event_geocode' },
    events: [
      { type: 'in_transit', label: 'In transit — departed facility', timestamp: '2026-01-21T10:22:00', locationText: 'Corbin, KY' },
      { type: 'in_transit', label: 'Arrived at FedEx facility', timestamp: '2026-01-21T06:10:00', locationText: 'Corbin, KY' },
      { type: 'in_transit', label: 'In transit', timestamp: '2026-01-20T19:45:00', locationText: 'Columbus, OH' },
      { type: 'pickup', label: 'Picked up by FedEx', timestamp: '2026-01-20T13:00:00', locationText: 'Warehouse — Cincinnati, OH' },
      { type: 'label_created', label: 'Shipment label created', timestamp: '2026-01-20T09:00:00', locationText: null },
    ],
  },
  '144RCQ7IMNAA5': {
    carrier: 'FedEx',
    trackingNumber: '144RCQ7IMNAA5',
    statusCode: 'DELIVERED',
    statusLabel: 'Delivered',
    lastEventAt: '2025-12-17T13:05:00',
    location: { mode: 'exact', lat: 36.1748, lng: -86.8103, label: '456 Oak Ave, Nashville, TN 37203' },
    proofOfDelivery: {
      deliveredAt: '2025-12-17T13:05:00',
      signedBy: 'J. SMITH',
      gpsAvailable: true,
    },
    events: [
      { type: 'delivered', label: 'Delivered', timestamp: '2025-12-17T13:05:00', locationText: '456 Oak Ave, Nashville, TN 37203' },
      { type: 'out_for_delivery', label: 'On FedEx vehicle for delivery', timestamp: '2025-12-17T08:20:00', locationText: 'Nashville, TN' },
      { type: 'local_facility', label: 'At local FedEx facility', timestamp: '2025-12-17T05:00:00', locationText: 'Nashville, TN 37203' },
      { type: 'in_transit', label: 'Departed FedEx hub', timestamp: '2025-12-16T22:30:00', locationText: 'Memphis, TN' },
      { type: 'label_created', label: 'Shipment label created', timestamp: '2025-12-15T10:00:00', locationText: null },
    ],
  },
  'Pending': {
    carrier: 'FedEx',
    trackingNumber: 'Pending',
    statusCode: 'LABEL_CREATED',
    statusLabel: 'Label Created',
    lastEventAt: '2026-01-18T09:00:00',
    location: { mode: 'none' },
    events: [
      { type: 'label_created', label: 'Shipment label created — awaiting carrier pickup', timestamp: '2026-01-18T09:00:00', locationText: 'Scottsdale, AZ' },
    ],
  },
  '144RCQ7IMNAA6': {
    carrier: 'FedEx',
    trackingNumber: '144RCQ7IMNAA6',
    statusCode: 'DELIVERED',
    statusLabel: 'Delivered',
    lastEventAt: '2026-01-13T15:30:00',
    location: { mode: 'exact', lat: 36.0331, lng: -86.7828, label: '789 Pine Rd, Brentwood, TN 37027' },
    proofOfDelivery: { deliveredAt: '2026-01-13T15:30:00', signedBy: 'B. JOHNSON', gpsAvailable: true },
    events: [
      { type: 'delivered', label: 'Delivered', timestamp: '2026-01-13T15:30:00', locationText: '789 Pine Rd, Brentwood, TN 37027' },
      { type: 'out_for_delivery', label: 'On FedEx vehicle for delivery', timestamp: '2026-01-13T08:45:00', locationText: 'Brentwood, TN' },
      { type: 'local_facility', label: 'At local FedEx facility', timestamp: '2026-01-13T04:50:00', locationText: 'Brentwood, TN 37027' },
      { type: 'in_transit', label: 'In transit', timestamp: '2026-01-12T20:00:00', locationText: 'Memphis, TN' },
      { type: 'label_created', label: 'Shipment label created', timestamp: '2026-01-12T10:00:00', locationText: null },
    ],
  },
  '144RCQ7IMNAA7': {
    carrier: 'FedEx',
    trackingNumber: '144RCQ7IMNAA7',
    statusCode: 'EXCEPTION',
    statusLabel: 'Exception',
    lastEventAt: '2025-12-11T11:00:00',
    exceptionMessage: 'Package arrived damaged',
    location: { mode: 'approximate', lat: 36.0331, lng: -86.7828, label: 'Brentwood, TN — delivery area', source: 'carrier_scan_city' },
    events: [
      { type: 'exception', label: 'Delivery exception — package damage reported', timestamp: '2025-12-11T11:00:00', locationText: 'Brentwood, TN', isException: true },
      { type: 'out_for_delivery', label: 'On FedEx vehicle for delivery', timestamp: '2025-12-11T08:00:00', locationText: 'Brentwood, TN' },
      { type: 'local_facility', label: 'At local FedEx facility', timestamp: '2025-12-11T05:10:00', locationText: 'Brentwood, TN 37027' },
      { type: 'in_transit', label: 'In transit', timestamp: '2025-12-10T21:00:00', locationText: 'Memphis, TN' },
      { type: 'label_created', label: 'Shipment label created', timestamp: '2025-12-10T09:00:00', locationText: null },
    ],
  },
};

export default function ShipmentVisibilityCard({ tracking }) {
  const [expanded, setExpanded] = useState(true);
  const shipment = MOCK_SHIPMENTS[tracking];

  if (!tracking || tracking === 'N/A') {
    return (
      <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 text-center">
        No carrier tracking available yet
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 text-center">
        Tracking created — awaiting first carrier scan
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Satellite className="w-3.5 h-3.5 text-[#8B1F1F]" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Shipment Visibility</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          <ShipmentStatusHeader shipment={shipment} />
          <ShipmentMap location={shipment.location} />

          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Tracking Timeline</p>
            <ShipmentTimeline events={shipment.events} />
          </div>

          {shipment.proofOfDelivery && (
            <ProofOfDeliverySection pod={shipment.proofOfDelivery} />
          )}
        </div>
      )}
    </div>
  );
}