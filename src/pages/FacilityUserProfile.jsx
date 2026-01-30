import React, { useState } from 'react';
import { User, Camera, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function FacilityUserProfile() {
  const [profileData, setProfileData] = useState({
    first_name: 'John',
    last_name: 'Administrator',
    email: 'john.admin@mochihealth.com',
    phone: '(555) 999-0000',
    profile_picture: null
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileData({ ...profileData, profile_picture: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Save to backend
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="user-profile-picture-upload"
              />
              <label
                htmlFor="user-profile-picture-upload"
                className="cursor-pointer group"
              >
                {profileData.profile_picture ? (
                  <img 
                    src={profileData.profile_picture} 
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#1a1f5c] shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1a1f5c] to-[#2a3f7c] flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <User className="w-14 h-14" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-xl border-2 border-[#1a1f5c] group-hover:bg-gray-50 transition-all">
                  <Camera className="w-5 h-5 text-[#1a1f5c]" />
                </div>
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Profile Picture</p>
              <p className="text-sm text-gray-600">Click to upload a new photo</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="mt-1"
            />
          </div>

          <Button onClick={handleSave} className="w-full bg-[#1a1f5c] hover:bg-[#151a4d] text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}