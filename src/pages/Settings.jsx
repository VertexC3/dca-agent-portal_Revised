import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, User, Bell, Shield, Palette, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    profile_picture: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    escalation_alerts: true,
    daily_summary: true,
  });

  React.useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        profile_picture: user.profile_picture || ''
      });
      
      setNotificationSettings({
        email_notifications: user.email_notifications ?? true,
        sms_notifications: user.sms_notifications ?? false,
        escalation_alerts: user.escalation_alerts ?? true,
        daily_summary: user.daily_summary ?? true,
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      alert('Profile updated successfully!');
    }
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      alert('Notification settings updated successfully!');
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setProfileData({ ...profileData, profile_picture: result.file_url });
      await updateProfileMutation.mutateAsync({ profile_picture: result.file_url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveNotifications = () => {
    updateNotificationsMutation.mutate(notificationSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-center">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to={createPageUrl('Dashboard')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b border-gray-200 bg-gray-50 rounded-none h-auto p-0">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#8B1F1F] rounded-none px-6 py-4"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#8B1F1F] rounded-none px-6 py-4"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#8B1F1F] rounded-none px-6 py-4"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="preferences"
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#8B1F1F] rounded-none px-6 py-4"
            >
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="profile" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h3>
                <p className="text-gray-600 mb-6">Update your account profile information.</p>

                <div className="space-y-4 max-w-2xl">
                  <div>
                    <Label className="text-gray-700 mb-2 block">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      {profileData.profile_picture ? (
                        <img 
                          src={profileData.profile_picture} 
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white text-2xl font-semibold border-2 border-gray-200">
                          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="profile-picture-upload"
                          disabled={uploadingImage}
                        />
                        <label htmlFor="profile-picture-upload">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingImage}
                            onClick={() => document.getElementById('profile-picture-upload').click()}
                            className="cursor-pointer"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Upload Picture'
                            )}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="full_name" className="text-gray-700">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label className="text-gray-700">Role</Label>
                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                      <span className="text-gray-700 capitalize">{user?.role || 'User'}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                <p className="text-gray-600 mb-6">Manage how you receive notifications.</p>

                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email alerts for new communications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, email_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive text alerts for urgent communications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sms_notifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, sms_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Escalation Alerts</p>
                      <p className="text-sm text-gray-600">Get notified when AI escalates to human</p>
                    </div>
                    <Switch
                      checked={notificationSettings.escalation_alerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, escalation_alerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Daily Summary</p>
                      <p className="text-sm text-gray-600">Receive daily communication summaries</p>
                    </div>
                    <Switch
                      checked={notificationSettings.daily_summary}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, daily_summary: checked })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleSaveNotifications}
                    disabled={updateNotificationsMutation.isPending}
                    className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
                  >
                    {updateNotificationsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h3>
                <p className="text-gray-600 mb-6">Manage your account security.</p>

                <div className="space-y-4 max-w-2xl">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">Password</p>
                    <p className="text-sm text-gray-600 mb-3">Change your password to keep your account secure</p>
                    <Button variant="outline" className="border-gray-300">
                      Change Password
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                    <Button variant="outline" className="border-gray-300">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">Active Sessions</p>
                    <p className="text-sm text-gray-600 mb-3">Manage your active sessions across devices</p>
                    <Button variant="outline" className="border-gray-300">
                      View Sessions
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Application Preferences</h3>
                <p className="text-gray-600 mb-6">Customize your experience.</p>

                <div className="space-y-4 max-w-2xl">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">Language</p>
                    <p className="text-sm text-gray-600 mb-3">Choose your preferred language</p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">Time Zone</p>
                    <p className="text-sm text-gray-600 mb-3">Set your local time zone</p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                    </select>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800 mb-2">Default View</p>
                    <p className="text-sm text-gray-600 mb-3">Choose your default dashboard view</p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Dashboard</option>
                      <option>Communications</option>
                      <option>Analytics</option>
                    </select>
                  </div>

                  <Button className="bg-[#8B1F1F] hover:bg-[#721919] text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}