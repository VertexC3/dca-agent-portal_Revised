import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2, Plus, Trash2, Package, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import OrderHistory from '../components/patient/OrderHistory';
import CollapsibleOrderHistory from '../components/patient/CollapsibleOrderHistory';
import PaymentManagement from '../components/patient/PaymentManagement';

export default function PatientProfile() {
  const queryClient = useQueryClient();
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    current_address: '',
    addresses: [],
    additional_addresses: [],
    allergies: '',
    current_medications: '',
    known_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  React.useEffect(() => {
    if (user) {
      // Migrate old addresses to new format if needed
      let addresses = user.addresses || [];
      if (!addresses.length && user.current_address) {
        addresses = [{
          name: 'Home',
          address: user.current_address,
          delivery_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          delivery_time: '9:00 AM - 5:00 PM'
        }];
      }
      
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        current_address: user.current_address || '',
        addresses: addresses,
        additional_addresses: user.additional_addresses || [],
        allergies: user.allergies || '',
        current_medications: user.current_medications || '',
        known_conditions: user.known_conditions || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || ''
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      alert('Profile updated successfully!');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(profileData);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture: result.file_url });
      queryClient.invalidateQueries(['currentUser']);
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const addAddress = () => {
    setProfileData({
      ...profileData,
      addresses: [
        ...profileData.addresses,
        {
          name: 'Home',
          address: '',
          delivery_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          delivery_time: '9:00 AM - 5:00 PM',
          is_primary: false
        }
      ]
    });
  };

  const togglePrimary = (index) => {
    const newAddresses = profileData.addresses.map((addr, idx) => ({
      ...addr,
      is_primary: idx === index
    }));
    setProfileData({ ...profileData, addresses: newAddresses });
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...profileData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setProfileData({ ...profileData, addresses: newAddresses });
  };

  const toggleDeliveryDay = (addressIndex, day) => {
    const newAddresses = [...profileData.addresses];
    const address = newAddresses[addressIndex];
    const days = address.delivery_days || [];
    
    if (days.includes(day)) {
      // Removing day - no validation needed
      address.delivery_days = days.filter(d => d !== day);
    } else {
      // Check for overlap with other addresses
      const overlap = newAddresses.find((addr, idx) => 
        idx !== addressIndex && 
        addr.delivery_days?.includes(day)
      );
      
      if (overlap) {
        alert(`Hmm, it looks like there's an overlap. "${overlap.name || 'Another address'}" already has ${day} selected. Please choose only one address for this day.`);
        return;
      }
      
      address.delivery_days = [...days, day];
    }
    
    setProfileData({ ...profileData, addresses: newAddresses });
  };

  const removeAddress = (index) => {
    const newAddresses = profileData.addresses.filter((_, i) => i !== index);
    setProfileData({ ...profileData, addresses: newAddresses });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="bg-white rounded-2xl border border-gray-200 shadow-lg">
        <TabsList className="w-full justify-start border-b border-gray-200 bg-gray-50 rounded-t-2xl h-auto p-0">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#8B1F1F] rounded-none px-6 py-4"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="payment"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#8B1F1F] rounded-none px-6 py-4"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger 
            value="orders"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#8B1F1F] rounded-none px-6 py-4"
          >
            <Package className="w-4 h-4 mr-2" />
            Order History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="p-8 space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center pb-6 border-b border-gray-200">
          <div className="relative">
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt={user.full_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-picture-upload"
              disabled={uploadingImage}
            />
            <label
              htmlFor="profile-picture-upload"
              className="absolute bottom-0 right-0 bg-[#8B1F1F] text-white p-2 rounded-full cursor-pointer hover:bg-[#721919] transition-all shadow-lg"
            >
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </label>
          </div>
          <p className="mt-3 text-sm text-gray-600">Click the icon to upload a profile picture</p>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#8B1F1F]" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={profileData.email}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={profileData.date_of_birth}
                onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#8B1F1F]" />
            Delivery Addresses
          </h3>
          <div className="space-y-6">
            {profileData.addresses.map((addr, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Select 
                    value={addr.name || 'Home'} 
                    onValueChange={(value) => updateAddress(index, 'name', value)}
                  >
                    <SelectTrigger className="flex-1 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeAddress(index)}
                    className="text-red-600 hover:text-red-700 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`primary-${index}`}
                    checked={addr.is_primary || false}
                    onCheckedChange={() => togglePrimary(index)}
                  />
                  <label
                    htmlFor={`primary-${index}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1"
                  >
                    <Star className={`w-4 h-4 ${addr.is_primary ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    Primary Address
                  </label>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-600">Full Address</Label>
                  <Textarea
                    value={addr.address || ''}
                    onChange={(e) => updateAddress(index, 'address', e.target.value)}
                    placeholder="123 Main St, Springfield, IL 62701"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">Delivery Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDeliveryDay(index, day)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          (addr.delivery_days || []).includes(day)
                            ? 'bg-[#8B1F1F] text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-300 hover:border-[#8B1F1F]'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Delivery Time Window</Label>
                  <Input
                    value={addr.delivery_time || ''}
                    onChange={(e) => updateAddress(index, 'delivery_time', e.target.value)}
                    placeholder="9:00 AM - 5:00 PM"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addAddress}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <Label>Known Allergies</Label>
              <Textarea
                value={profileData.allergies}
                onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                placeholder="Penicillin, Peanuts, etc."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Current Medications</Label>
              <Textarea
                value={profileData.current_medications}
                onChange={(e) => setProfileData({ ...profileData, current_medications: e.target.value })}
                placeholder="List your current medications..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Known Medical Conditions</Label>
              <Textarea
                value={profileData.known_conditions}
                onChange={(e) => setProfileData({ ...profileData, known_conditions: e.target.value })}
                placeholder="Hypertension, Diabetes, etc."
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contact Name</Label>
              <Input
                value={profileData.emergency_contact_name}
                onChange={(e) => setProfileData({ ...profileData, emergency_contact_name: e.target.value })}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input
                value={profileData.emergency_contact_phone}
                onChange={(e) => setProfileData({ ...profileData, emergency_contact_phone: e.target.value })}
                placeholder="(555) 987-6543"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-[#8B1F1F] hover:bg-[#721919] text-white"
          >
            {updateMutation.isPending ? (
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
        </TabsContent>

        <TabsContent value="payment" className="p-8">
          <PaymentManagement user={user} />
        </TabsContent>

        <TabsContent value="orders" className="p-8" id="orders">
          <CollapsibleOrderHistory limit={null} showSeeAll={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}