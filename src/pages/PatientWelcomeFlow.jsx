import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Heart, Pill, MapPin, Phone, PartyPopper, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPageUrl } from '../utils';
import TagInput from '../components/welcome/TagInput';
import PrescriptionInput from '../components/welcome/PrescriptionInput';

export default function PatientWelcomeFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country_code: '+1',
    date_of_birth: '',
    allergies: [],
    current_medications: [],
    known_conditions: [],
    current_prescriptions: [],
    addresses: [
      { name: 'Home', address: '', delivery_days: [], delivery_time: '9:00 AM - 5:00 PM', is_primary: true }
    ],
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: User,
      description: 'Let\'s start with your basic details'
    },
    {
      id: 'medical',
      title: 'Medical History',
      icon: Heart,
      description: 'Help us understand your medical background'
    },
    {
      id: 'prescriptions',
      title: 'Current Medications',
      icon: Pill,
      description: 'Tell us about your current prescriptions'
    },
    {
      id: 'addresses',
      title: 'Delivery Addresses',
      icon: MapPin,
      description: 'Where should we deliver your medications?'
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      icon: Phone,
      description: 'Who should we contact in case of emergency?'
    },
    {
      id: 'complete',
      title: 'Welcome!',
      icon: PartyPopper,
      description: 'You\'re all set'
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save to localStorage
    const existingUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    const updatedUser = { 
      ...existingUser, 
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`,
      profile_picture: profilePicture,
      // Convert arrays to strings for backward compatibility
      allergies: formData.allergies.join(', '),
      current_medications: formData.current_medications.join(', '),
      known_conditions: formData.known_conditions.join(', ')
    };
    localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    alert('Profile completed successfully!');
    window.location.href = createPageUrl('PatientDashboard');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicture(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDateChange = (displayValue) => {
    // Remove any non-numeric characters except /
    const cleaned = displayValue.replace(/[^\d/]/g, '');
    
    // Auto-add slashes
    let formatted = cleaned;
    if (cleaned.length >= 2 && cleaned.indexOf('/') === -1) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5 && cleaned.split('/').length === 2) {
      const parts = cleaned.split('/');
      formatted = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
    }
    
    // Convert to ISO format for storage
    if (formatted.length === 10) {
      const [month, day, year] = formatted.split('/');
      if (month && day && year && month <= 12 && day <= 31) {
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        setFormData({ ...formData, date_of_birth: isoDate });
        return;
      }
    }
    
    // For partial dates, just store the formatted value
    setFormData({ ...formData, date_of_birth: formatted });
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const toggleDeliveryDay = (index, day) => {
    const newAddresses = [...formData.addresses];
    const days = newAddresses[index].delivery_days || [];
    
    if (days.includes(day)) {
      newAddresses[index].delivery_days = days.filter(d => d !== day);
    } else {
      // Check for overlap with other addresses
      const overlap = newAddresses.find((addr, idx) => 
        idx !== index && 
        addr.delivery_days?.includes(day)
      );
      
      if (overlap) {
        alert(`This day is already assigned to "${overlap.name}". Please choose a different day or remove it from the other address first.`);
        return;
      }
      
      newAddresses[index].delivery_days = [...days, day];
    }
    
    setFormData({ ...formData, addresses: newAddresses });
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [
        ...formData.addresses,
        { name: 'Home', address: '', delivery_days: [], delivery_time: '9:00 AM - 5:00 PM', is_primary: false }
      ]
    });
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-600">Step {currentStep + 1} of {steps.length}</h2>
            <span className="text-sm font-semibold text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Step Header */}
          <div className="text-center mb-8">
            {currentStep === 0 ? (
              <div className="relative inline-block mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="cursor-pointer group"
                >
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#8B1F1F]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white border-4 border-[#8B1F1F]">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-[#8B1F1F] group-hover:bg-gray-50 transition-all">
                    <Camera className="w-4 h-4 text-[#8B1F1F]" />
                  </div>
                </label>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8B1F1F] text-white mb-4">
                <StepIcon className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{steps[currentStep].title}</h1>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="John"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Doe"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={formData.country_code} onValueChange={(value) => setFormData({ ...formData, country_code: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                        <SelectItem value="+91">🇮🇳 +91</SelectItem>
                        <SelectItem value="+86">🇨🇳 +86</SelectItem>
                        <SelectItem value="+81">🇯🇵 +81</SelectItem>
                        <SelectItem value="+49">🇩🇪 +49</SelectItem>
                        <SelectItem value="+33">🇫🇷 +33</SelectItem>
                        <SelectItem value="+39">🇮🇹 +39</SelectItem>
                        <SelectItem value="+34">🇪🇸 +34</SelectItem>
                        <SelectItem value="+61">🇦🇺 +61</SelectItem>
                        <SelectItem value="+52">🇲🇽 +52</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Date of Birth (MM/DD/YYYY) *</Label>
                  <Input
                    value={formData.date_of_birth.includes('-') ? formatDateForDisplay(formData.date_of_birth) : formData.date_of_birth}
                    onChange={(e) => handleDateChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    maxLength={10}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {/* Step 1: Medical History */}
            {currentStep === 1 && (
              <>
                <div>
                  <Label>Known Allergies</Label>
                  <div className="mt-1">
                    <TagInput
                      value={formData.allergies}
                      onChange={(value) => setFormData({ ...formData, allergies: value })}
                      placeholder="Type allergy and press comma (e.g., Penicillin, Peanuts)"
                    />
                  </div>
                </div>
                <div>
                  <Label>Current Medications</Label>
                  <div className="mt-1">
                    <TagInput
                      value={formData.current_medications}
                      onChange={(value) => setFormData({ ...formData, current_medications: value })}
                      placeholder="Type medication and press comma (e.g., Aspirin, Metformin)"
                    />
                  </div>
                </div>
                <div>
                  <Label>Known Medical Conditions</Label>
                  <div className="mt-1">
                    <TagInput
                      value={formData.known_conditions}
                      onChange={(value) => setFormData({ ...formData, known_conditions: value })}
                      placeholder="Type condition and press comma (e.g., Hypertension, Diabetes)"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Current Prescriptions */}
            {currentStep === 2 && (
              <div>
                <Label>Current Prescriptions</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Add any prescriptions you're currently taking. We'll automatically recognize common medications.
                </p>
                <PrescriptionInput
                  value={formData.current_prescriptions}
                  onChange={(value) => setFormData({ ...formData, current_prescriptions: value })}
                />
              </div>
            )}

            {/* Step 3: Addresses */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {formData.addresses.map((addr, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <Select 
                      value={addr.name || 'Home'} 
                      onValueChange={(value) => updateAddress(index, 'name', value)}
                    >
                      <SelectTrigger className="font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div>
                      <Label className="text-xs text-gray-600">Full Address *</Label>
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
                  Add Another Address
                </Button>
              </div>
            )}

            {/* Step 4: Emergency Contact */}
            {currentStep === 4 && (
              <>
                <div>
                  <Label>Emergency Contact Name *</Label>
                  <Input
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="Jane Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Emergency Contact Phone *</Label>
                  <Input
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    placeholder="(555) 987-6543"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {/* Step 5: Welcome */}
            {currentStep === 5 && (
              <div className="py-8">
                <div className="text-center mb-8">
                  <Check className="w-20 h-20 mx-auto text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h2>
                  <p className="text-gray-600 mb-6">
                    Your profile has been completed. You can now access all features of the patient portal.
                  </p>
                </div>

                {/* Profile Overview */}
                <div className="space-y-4 max-w-2xl mx-auto">
                  {/* Basic Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </h3>
                    <div className="space-y-1.5 text-base">
                      <p className="text-blue-800"><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
                      <p className="text-blue-800"><strong>Phone:</strong> {formData.country_code} {formData.phone}</p>
                      <p className="text-blue-800"><strong>Date of Birth:</strong> {formData.date_of_birth.includes('-') ? formatDateForDisplay(formData.date_of_birth) : formData.date_of_birth}</p>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Medical History
                    </h3>
                    <div className="space-y-1.5 text-base">
                      <p className="text-purple-800"><strong>Allergies:</strong> {formData.allergies.length > 0 ? formData.allergies.join(', ') : 'None'}</p>
                      <p className="text-purple-800"><strong>Current Medications:</strong> {formData.current_medications.length > 0 ? formData.current_medications.join(', ') : 'None'}</p>
                      <p className="text-purple-800"><strong>Medical Conditions:</strong> {formData.known_conditions.length > 0 ? formData.known_conditions.join(', ') : 'None'}</p>
                    </div>
                  </div>

                  {/* Prescriptions */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      Current Prescriptions
                    </h3>
                    <div className="space-y-1.5 text-base">
                      {formData.current_prescriptions.length > 0 ? (
                        formData.current_prescriptions.map((rx, idx) => (
                          <p key={idx} className="text-green-800">• {rx.name} - {rx.dosage}</p>
                        ))
                      ) : (
                        <p className="text-green-800">None added</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Addresses */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Addresses
                    </h3>
                    <div className="space-y-3 text-base">
                      {formData.addresses.map((addr, idx) => (
                        <div key={idx} className="text-orange-800">
                          <p><strong>{addr.name}:</strong> {addr.address}</p>
                          <p className="text-sm">Delivery Days: {addr.delivery_days.length > 0 ? addr.delivery_days.join(', ') : 'Not set'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Emergency Contact
                    </h3>
                    <div className="space-y-1.5 text-base">
                      <p className="text-red-800"><strong>Name:</strong> {formData.emergency_contact_name}</p>
                      <p className="text-red-800"><strong>Phone:</strong> {formData.emergency_contact_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            {currentStep < steps.length - 2 && (
              <Button
                onClick={handleNext}
                className="ml-auto bg-[#8B1F1F] hover:bg-[#721919] text-white flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === steps.length - 2 && (
              <Button
                onClick={handleNext}
                className="ml-auto bg-[#8B1F1F] hover:bg-[#721919] text-white flex items-center gap-2"
              >
                Complete Setup
                <Check className="w-4 h-4" />
              </Button>
            )}

            {currentStep === steps.length - 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="ml-auto bg-[#8B1F1F] hover:bg-[#721919] text-white px-8"
                >
                  Go to Dashboard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}