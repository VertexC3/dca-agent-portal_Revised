import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfileEditDialog({ open, onClose }) {
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('facilityUser');
    return stored ? JSON.parse(stored) : { 
      full_name: "Agent User", 
      email: "agent@dcapharmacy.com",
      first_name: "",
      last_name: "",
      title: "",
      bio: "",
      profile_picture: null 
    };
  });

  const [preview, setPreview] = useState(profile.profile_picture);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result;
        setPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updated = { ...profile, profile_picture: preview };
    localStorage.setItem('facilityUser', JSON.stringify(updated));
    localStorage.setItem('mockUser', JSON.stringify(updated));
    window.dispatchEvent(new Event('facilityProfileUpdated'));
    window.dispatchEvent(new Event('storage'));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white font-semibold text-2xl">
                  {profile.first_name?.charAt(0)?.toUpperCase() || profile.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#8B1F1F] text-white p-2 rounded-full cursor-pointer hover:bg-[#721919] transition-all">
                <Upload className="w-3 h-3" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">Click upload icon to change photo</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={profile.first_name || ''}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B1F1F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={profile.last_name || ''}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B1F1F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={profile.title || ''}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="e.g., Senior Agent, Supervisor"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B1F1F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B1F1F] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[#8B1F1F] hover:bg-[#721919]">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}