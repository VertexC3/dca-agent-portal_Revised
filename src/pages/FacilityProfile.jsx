import React, { useState } from 'react';
import { Building2, Camera, Save, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function FacilityProfile() {
  const [facilityData, setFacilityData] = useState({
    facility_name: 'Mochi Health Corp.',
    address_1: '123 Healthcare Blvd',
    address_2: 'Suite 500',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    tax_id: '12-3456789',
    contact_email: 'billing@mochihealth.com',
    contact_phone: '(555) 888-0000',
    logo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695285fc94e8ef46bde70e16/6281fe319_MochiHealth.png'
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFacilityData({ ...facilityData, logo_url: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Save to backend
    alert('Facility profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facility Profile</h1>
        <p className="text-gray-600 mt-1">Manage facility information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Facility Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Facility Logo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="facility-logo-upload"
              />
              <label
                htmlFor="facility-logo-upload"
                className="cursor-pointer group"
              >
                {facilityData.logo_url ? (
                  <img 
                    src={facilityData.logo_url} 
                    alt="Facility Logo"
                    className="w-32 h-32 object-contain border-4 border-[#1a1f5c] rounded-lg shadow-lg bg-white p-2"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-[#1a1f5c] to-[#2a3f7c] flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <Building2 className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-xl border-2 border-[#1a1f5c] group-hover:bg-gray-50 transition-all">
                  <Camera className="w-4 h-4 text-[#1a1f5c]" />
                </div>
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Facility Logo</p>
              <p className="text-sm text-gray-600">Click to upload a new logo</p>
              <p className="text-xs text-gray-500 mt-1">Recommended: Square image, transparent background</p>
            </div>
          </div>

          {/* Facility Name */}
          <div>
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Facility Name
            </Label>
            <Input
              value={facilityData.facility_name}
              onChange={(e) => setFacilityData({ ...facilityData, facility_name: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </Label>
            <div className="grid gap-4">
              <Input
                value={facilityData.address_1}
                onChange={(e) => setFacilityData({ ...facilityData, address_1: e.target.value })}
                placeholder="Address Line 1"
              />
              <Input
                value={facilityData.address_2}
                onChange={(e) => setFacilityData({ ...facilityData, address_2: e.target.value })}
                placeholder="Address Line 2 (Optional)"
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  value={facilityData.city}
                  onChange={(e) => setFacilityData({ ...facilityData, city: e.target.value })}
                  placeholder="City"
                  className="col-span-2"
                />
                <Input
                  value={facilityData.state}
                  onChange={(e) => setFacilityData({ ...facilityData, state: e.target.value })}
                  placeholder="State"
                  maxLength={2}
                />
              </div>
              <Input
                value={facilityData.zip}
                onChange={(e) => setFacilityData({ ...facilityData, zip: e.target.value })}
                placeholder="Zip Code"
                className="w-40"
                maxLength={10}
              />
            </div>
          </div>

          {/* Tax ID */}
          <div>
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Tax ID (EIN)
            </Label>
            <Input
              value={facilityData.tax_id}
              onChange={(e) => setFacilityData({ ...facilityData, tax_id: e.target.value })}
              className="mt-1"
              placeholder="XX-XXXXXXX"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Email
              </Label>
              <Input
                type="email"
                value={facilityData.contact_email}
                onChange={(e) => setFacilityData({ ...facilityData, contact_email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Phone
              </Label>
              <Input
                value={facilityData.contact_phone}
                onChange={(e) => setFacilityData({ ...facilityData, contact_phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-[#1a1f5c] hover:bg-[#151a4d] text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Facility Profile
          </Button>
        </CardContent>
      </Card>

      {/* Additional Info Card */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This information will be used on invoices and official communications with DCA Pharmacy.
            Ensure all details are accurate and up to date.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}