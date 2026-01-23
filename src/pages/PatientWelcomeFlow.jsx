import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Heart, Pill, MapPin, Phone, PartyPopper, Camera, Calendar as CalendarIcon, Trash2, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';
import TagInput from '../components/welcome/TagInput';
import PrescriptionInput from '../components/welcome/PrescriptionInput';
import AddressMap from '../components/welcome/AddressMap';
import { geocodeAddress } from '../components/welcome/geocodeAddress';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientWelcomeFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [addressCoordinates, setAddressCoordinates] = useState({});
  const [fieldMessages, setFieldMessages] = useState({});
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
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
      { name: 'Home', address_1: '', address_2: '', city: '', state: '', zip: '', delivery_days: [], delivery_from: null, delivery_to: null, delivery_time: '9:00 AM - 5:00 PM', is_primary: true }
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

  const handleValidatePhone = () => {
    setShowMfaDialog(true);
    setMfaCode('');
  };

  const handleMfaSubmit = () => {
    if (mfaCode === '123456') {
      setPhoneValidated(true);
      setShowMfaDialog(false);
      setMfaCode('');
    } else {
      alert('Invalid code. Please try again.');
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
      phone_validated: phoneValidated,
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
      const imageData = event.target.result;
      setProfilePicture(imageData);
      
      // Save to localStorage immediately
      const existingUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
      const updatedUser = { ...existingUser, profile_picture: imageData };
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      
      // Trigger a custom event to notify Layout
      window.dispatchEvent(new Event('userProfileUpdated'));
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

  const handlePhoneChange = (value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    let formatted = cleaned;
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        formatted = `(${cleaned}`;
      } else if (cleaned.length <= 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      } else {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    }
    
    setFormData({ ...formData, phone: formatted });
  };

  const updateAddress = async (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });

    // Show encouragement messages only when field is completed
    const messageKey = `${index}-${field}`;
    if (value && value.trim().length > 0) {
      const messages = {
        'address_1': value.trim().length >= 3 ? '✓ Great! Address 1 completed, now add your city...' : null,
        'city': value.trim().length >= 2 ? '✓ Excellent! City added, now select your state...' : null,
        'state': value.length === 2 ? '✓ Perfect! State selected, now enter your zip code...' : null,
        'zip': value.length >= 5 ? '✓ Awesome! Zip code added, generating map...' : null
      };
      if (messages[field]) {
        setFieldMessages(prev => ({ ...prev, [messageKey]: messages[field] }));
        setTimeout(() => {
          setFieldMessages(prev => {
            const newMessages = { ...prev };
            delete newMessages[messageKey];
            return newMessages;
          });
        }, 3000);
      }
    }

    // Geocode when zip is completed and other fields are present
    const addr = newAddresses[index];
    if (addr.address_1 && addr.city && addr.state && addr.zip && addr.zip.length >= 5) {
      const coords = await geocodeAddress(addr);
      if (coords) {
        setAddressCoordinates(prev => ({ ...prev, [index]: coords }));
      }
    }
  };

  const refreshMap = async (index) => {
    const addr = formData.addresses[index];
    if (addr.address_1 && addr.city && addr.state && addr.zip && addr.zip.length >= 5) {
      const coords = await geocodeAddress(addr);
      if (coords) {
        setAddressCoordinates(prev => ({ ...prev, [index]: coords }));
      }
    }
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
        { name: 'Home', address_1: '', address_2: '', city: '', state: '', zip: '', delivery_days: [], delivery_from: null, delivery_to: null, delivery_time: '9:00 AM - 5:00 PM', is_primary: false }
      ]
    });
  };

  const removeAddress = (index) => {
    if (formData.addresses.length === 1) {
      alert('You must have at least one address.');
      return;
    }
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
    
    // Clean up coordinates
    const newCoordinates = { ...addressCoordinates };
    delete newCoordinates[index];
    setAddressCoordinates(newCoordinates);
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-y-auto">
      {/* Animated Background with Parallax */}
      <motion.div 
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
        animate={{
          y: [0, -40, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10 py-16 px-4">
        {/* Enhanced Progress Bar */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-3">
            <motion.h2 
              className="text-sm font-semibold text-gray-700 tracking-wide"
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Step {currentStep + 1} of {steps.length}
            </motion.h2>
            <motion.span 
              className="text-sm font-bold text-[#8B1F1F]"
              key={`progress-${currentStep}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
          <div className="relative h-3 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8B1F1F] to-[#B52A2A] rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Main Card with Enhanced Animation */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20"
          >
            {/* Step Header with Enhanced Animation */}
            <motion.div 
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {currentStep === 0 ? (
                <motion.div 
                  className="relative inline-block mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
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
                      <motion.img 
                        src={profilePicture} 
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border-4 border-[#8B1F1F] shadow-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#8B1F1F] to-[#B52A2A] flex items-center justify-center text-white border-4 border-white shadow-xl">
                        <User className="w-14 h-14" />
                      </div>
                    )}
                    <motion.div 
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-xl border-2 border-[#8B1F1F] group-hover:bg-gray-50 transition-all"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Camera className="w-5 h-5 text-[#8B1F1F]" />
                    </motion.div>
                  </label>
                </motion.div>
              ) : (
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8B1F1F] to-[#B52A2A] text-white mb-6 shadow-xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  <StepIcon className="w-10 h-10" />
                </motion.div>
              )}
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {steps[currentStep].title}
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {steps[currentStep].description}
              </motion.p>
            </motion.div>

            {/* Enhanced Navigation Buttons */}
            <motion.div 
              className="flex gap-4 mb-8 pb-6 border-b border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2 h-12 px-6 border-2 border-gray-300 hover:border-[#8B1F1F] hover:bg-[#8B1F1F]/5 font-semibold"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </Button>
                </motion.div>
              )}
              
              {currentStep < steps.length - 2 && (
                <motion.div className="ml-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-[#8B1F1F] to-[#B52A2A] hover:from-[#721919] hover:to-[#8B1F1F] text-white flex items-center gap-2 h-12 px-8 shadow-lg font-semibold"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}

              {currentStep === steps.length - 2 && (
                <motion.div className="ml-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-[#8B1F1F] to-[#B52A2A] hover:from-[#721919] hover:to-[#8B1F1F] text-white flex items-center gap-2 h-12 px-8 shadow-lg font-semibold"
                  >
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}

              {currentStep === steps.length - 1 && (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex items-center gap-2 h-12 px-6 border-2 border-gray-300 hover:border-[#8B1F1F] hover:bg-[#8B1F1F]/5 font-semibold"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </Button>
                  </motion.div>
                  <motion.div className="ml-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-[#8B1F1F] to-[#B52A2A] hover:from-[#721919] hover:to-[#8B1F1F] text-white h-12 px-10 shadow-xl font-bold text-lg"
                    >
                      Go to Dashboard
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Step Content with Stagger Animation */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {/* Step 0: Basic Information */}
              {currentStep === 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.doe@example.com"
                      className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                    />
                  </motion.div>
                  <motion.div 
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div>
                      <Label className="text-base font-semibold text-gray-700">First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="John"
                        className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-gray-700">Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Doe"
                        className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Phone Number *</Label>
                    <div className="flex gap-2 mt-2">
                      <Select value={formData.country_code} onValueChange={(value) => setFormData({ ...formData, country_code: value })}>
                        <SelectTrigger className="w-32 h-12 border-gray-200 text-base">
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
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(555) 123-4567"
                        maxLength={14}
                        className="flex-1 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                      />
                      {phoneValidated ? (
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg border-2 border-green-500">
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleValidatePhone}
                          disabled={!formData.phone}
                          className="h-12 bg-[#8B1F1F] hover:bg-[#721919] text-white"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Validate
                        </Button>
                      )}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Date of Birth (MM/DD/YYYY) *</Label>
                    <Input
                      value={formData.date_of_birth.includes('-') ? formatDateForDisplay(formData.date_of_birth) : formData.date_of_birth}
                      onChange={(e) => handleDateChange(e.target.value)}
                      placeholder="MM/DD/YYYY"
                      maxLength={10}
                      className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                    />
                  </motion.div>
              </>
            )}

              {/* Step 1: Medical History */}
              {currentStep === 1 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Known Allergies</Label>
                    <div className="mt-2">
                      <TagInput
                        value={formData.allergies}
                        onChange={(value) => setFormData({ ...formData, allergies: value })}
                        placeholder="Type allergy and press comma (e.g., Penicillin, Peanuts)"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Current Medications</Label>
                    <div className="mt-2">
                      <TagInput
                        value={formData.current_medications}
                        onChange={(value) => setFormData({ ...formData, current_medications: value })}
                        placeholder="Type medication and press comma (e.g., Aspirin, Metformin)"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Known Medical Conditions</Label>
                    <div className="mt-2">
                      <TagInput
                        value={formData.known_conditions}
                        onChange={(value) => setFormData({ ...formData, known_conditions: value })}
                        placeholder="Type condition and press comma (e.g., Hypertension, Diabetes)"
                      />
                    </div>
                  </motion.div>
              </>
            )}

              {/* Step 2: Current Prescriptions */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label className="text-base font-semibold text-gray-700">Current Prescriptions</Label>
                  <p className="text-base text-gray-600 mb-4 mt-1">
                    Add any prescriptions you're currently taking. We'll automatically recognize common medications.
                  </p>
                  <PrescriptionInput
                    value={formData.current_prescriptions}
                    onChange={(value) => setFormData({ ...formData, current_prescriptions: value })}
                  />
                </motion.div>
              )}

              {/* Step 3: Addresses */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {formData.addresses.map((addr, index) => (
                    <motion.div 
                      key={index} 
                      className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4 relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {index > 0 && (
                        <button
                          onClick={() => removeAddress(index)}
                          className="absolute top-4 right-4 p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      <Select 
                        value={addr.name || 'Home'} 
                        onValueChange={(value) => updateAddress(index, 'name', value)}
                      >
                        <SelectTrigger className="font-semibold h-12 border-gray-200 text-base">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-semibold text-gray-700">Address 1 *</Label>
                          <Input
                            value={addr.address_1 || ''}
                            onChange={(e) => updateAddress(index, 'address_1', e.target.value)}
                            placeholder="123 Main St"
                            className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                          />
                          {fieldMessages[`${index}-address_1`] && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-sm text-green-600 mt-1 font-medium"
                            >
                              {fieldMessages[`${index}-address_1`]}
                            </motion.p>
                          )}
                        </div>
                        <div>
                          <Label className="text-base font-semibold text-gray-700">Address 2 (Optional)</Label>
                          <Input
                            value={addr.address_2 || ''}
                            onChange={(e) => updateAddress(index, 'address_2', e.target.value)}
                            placeholder="Apt 4B"
                            className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-1">
                            <Label className="text-base font-semibold text-gray-700">City *</Label>
                            <Input
                              value={addr.city || ''}
                              onChange={(e) => updateAddress(index, 'city', e.target.value)}
                              placeholder="Springfield"
                              className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                            />
                            {fieldMessages[`${index}-city`] && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-green-600 mt-1 font-medium"
                              >
                                {fieldMessages[`${index}-city`]}
                              </motion.p>
                            )}
                          </div>
                          <div className="col-span-1">
                            <Label className="text-base font-semibold text-gray-700">State *</Label>
                            <Select value={addr.state || ''} onValueChange={(value) => updateAddress(index, 'state', value)}>
                              <SelectTrigger className="mt-2 h-12 border-gray-200 text-base">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                <SelectItem value="AL">AL</SelectItem>
                                <SelectItem value="AK">AK</SelectItem>
                                <SelectItem value="AZ">AZ</SelectItem>
                                <SelectItem value="AR">AR</SelectItem>
                                <SelectItem value="CA">CA</SelectItem>
                                <SelectItem value="CO">CO</SelectItem>
                                <SelectItem value="CT">CT</SelectItem>
                                <SelectItem value="DE">DE</SelectItem>
                                <SelectItem value="FL">FL</SelectItem>
                                <SelectItem value="GA">GA</SelectItem>
                                <SelectItem value="HI">HI</SelectItem>
                                <SelectItem value="ID">ID</SelectItem>
                                <SelectItem value="IL">IL</SelectItem>
                                <SelectItem value="IN">IN</SelectItem>
                                <SelectItem value="IA">IA</SelectItem>
                                <SelectItem value="KS">KS</SelectItem>
                                <SelectItem value="KY">KY</SelectItem>
                                <SelectItem value="LA">LA</SelectItem>
                                <SelectItem value="ME">ME</SelectItem>
                                <SelectItem value="MD">MD</SelectItem>
                                <SelectItem value="MA">MA</SelectItem>
                                <SelectItem value="MI">MI</SelectItem>
                                <SelectItem value="MN">MN</SelectItem>
                                <SelectItem value="MS">MS</SelectItem>
                                <SelectItem value="MO">MO</SelectItem>
                                <SelectItem value="MT">MT</SelectItem>
                                <SelectItem value="NE">NE</SelectItem>
                                <SelectItem value="NV">NV</SelectItem>
                                <SelectItem value="NH">NH</SelectItem>
                                <SelectItem value="NJ">NJ</SelectItem>
                                <SelectItem value="NM">NM</SelectItem>
                                <SelectItem value="NY">NY</SelectItem>
                                <SelectItem value="NC">NC</SelectItem>
                                <SelectItem value="ND">ND</SelectItem>
                                <SelectItem value="OH">OH</SelectItem>
                                <SelectItem value="OK">OK</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                                <SelectItem value="PA">PA</SelectItem>
                                <SelectItem value="RI">RI</SelectItem>
                                <SelectItem value="SC">SC</SelectItem>
                                <SelectItem value="SD">SD</SelectItem>
                                <SelectItem value="TN">TN</SelectItem>
                                <SelectItem value="TX">TX</SelectItem>
                                <SelectItem value="UT">UT</SelectItem>
                                <SelectItem value="VT">VT</SelectItem>
                                <SelectItem value="VA">VA</SelectItem>
                                <SelectItem value="WA">WA</SelectItem>
                                <SelectItem value="WV">WV</SelectItem>
                                <SelectItem value="WI">WI</SelectItem>
                                <SelectItem value="WY">WY</SelectItem>
                              </SelectContent>
                            </Select>
                            {fieldMessages[`${index}-state`] && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-green-600 mt-1 font-medium"
                              >
                                {fieldMessages[`${index}-state`]}
                              </motion.p>
                            )}
                          </div>
                          <div className="col-span-1">
                            <Label className="text-base font-semibold text-gray-700">Zip *</Label>
                            <Input
                              value={addr.zip || ''}
                              onChange={(e) => updateAddress(index, 'zip', e.target.value)}
                              placeholder="62701"
                              className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                              maxLength={10}
                            />
                            {fieldMessages[`${index}-zip`] && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-green-600 mt-1 font-medium"
                              >
                                {fieldMessages[`${index}-zip`]}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="relative h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                        {addressCoordinates[index] ? (
                          <AddressMap
                            lat={addressCoordinates[index].lat}
                            lon={addressCoordinates[index].lon}
                            address={`${addr.address_1}, ${addr.city}, ${addr.state} ${addr.zip}`}
                          />
                        ) : (
                          <p className="text-gray-500 text-sm">Enter address to see map</p>
                        )}
                        {addr.address_1 && addr.city && addr.state && addr.zip && addr.zip.length >= 5 && (
                          <button
                            onClick={() => refreshMap(index)}
                            className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all border border-gray-200"
                            title="Refresh map"
                          >
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold text-gray-700 mb-3 block">Delivery Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <motion.button
                              key={day}
                              type="button"
                              onClick={() => toggleDeliveryDay(index, day)}
                              className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${
                                (addr.delivery_days || []).includes(day)
                                  ? 'bg-gradient-to-r from-[#8B1F1F] to-[#B52A2A] text-white shadow-lg'
                                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-[#8B1F1F] hover:shadow-md'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {day.slice(0, 3)}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-base font-semibold text-gray-700">From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal mt-2 h-12 border-gray-200 hover:border-[#8B1F1F] text-base"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {addr.delivery_from ? format(new Date(addr.delivery_from), 'MMM d, yyyy') : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={addr.delivery_from ? new Date(addr.delivery_from) : undefined}
                                onSelect={(date) => updateAddress(index, 'delivery_from', date?.toISOString())}
                                captionLayout="dropdown-buttons"
                                fromYear={2020}
                                toYear={2030}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label className="text-base font-semibold text-gray-700">To</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal mt-2 h-12 border-gray-200 hover:border-[#8B1F1F] text-base"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {addr.delivery_to ? format(new Date(addr.delivery_to), 'MMM d, yyyy') : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={addr.delivery_to ? new Date(addr.delivery_to) : undefined}
                                onSelect={(date) => updateAddress(index, 'delivery_to', date?.toISOString())}
                                captionLayout="dropdown-buttons"
                                fromYear={2020}
                                toYear={2030}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold text-gray-700">Delivery Time Window</Label>
                        <Input
                          value={addr.delivery_time || ''}
                          onChange={(e) => updateAddress(index, 'delivery_time', e.target.value)}
                          placeholder="9:00 AM - 5:00 PM"
                          className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                        />
                      </div>
                    </motion.div>
                ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      variant="outline"
                      onClick={addAddress}
                      className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-[#8B1F1F] hover:bg-[#8B1F1F]/5 text-gray-700 font-semibold"
                    >
                      Add Another Address
                    </Button>
                  </motion.div>
              </div>
            )}

              {/* Step 4: Emergency Contact */}
              {currentStep === 4 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Emergency Contact Name *</Label>
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      placeholder="Jane Doe"
                      className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Emergency Contact Phone *</Label>
                    <Input
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      placeholder="(555) 987-6543"
                      className="mt-2 h-12 border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20 text-base"
                    />
                  </motion.div>
                </>
              )}

              {/* Step 5: Welcome */}
              {currentStep === 5 && (
                <div className="py-8">
                  <motion.div 
                    className="text-center mb-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <Check className="w-24 h-24 mx-auto text-green-500 mb-6" />
                    </motion.div>
                    <motion.h2 
                      className="text-3xl font-bold text-gray-800 mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      You're All Set!
                    </motion.h2>
                    <motion.p 
                      className="text-gray-600 text-lg mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Your profile has been completed. You can now access all features of the patient portal.
                    </motion.p>
                  </motion.div>

                  {/* Profile Overview */}
                  <div className="space-y-5 max-w-2xl mx-auto">
                    {/* Basic Information */}
                    <motion.div 
                      className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <User className="w-6 h-6" />
                        Basic Information
                      </h3>
                      <div className="space-y-2 text-base">
                        <p className="text-blue-800"><strong>Email:</strong> {formData.email}</p>
                        <p className="text-blue-800"><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
                        <p className="text-blue-800"><strong>Phone:</strong> {formData.country_code} {formData.phone} {phoneValidated && '✓ Verified'}</p>
                        <p className="text-blue-800"><strong>Date of Birth:</strong> {formData.date_of_birth.includes('-') ? formatDateForDisplay(formData.date_of_birth) : formData.date_of_birth}</p>
                      </div>
                    </motion.div>

                    {/* Medical History */}
                    <motion.div 
                      className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-6 shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6" />
                        Medical History
                      </h3>
                      <div className="space-y-2 text-base">
                        <p className="text-purple-800"><strong>Allergies:</strong> {formData.allergies.length > 0 ? formData.allergies.join(', ') : 'None'}</p>
                        <p className="text-purple-800"><strong>Current Medications:</strong> {formData.current_medications.length > 0 ? formData.current_medications.join(', ') : 'None'}</p>
                        <p className="text-purple-800"><strong>Medical Conditions:</strong> {formData.known_conditions.length > 0 ? formData.known_conditions.join(', ') : 'None'}</p>
                      </div>
                    </motion.div>

                    {/* Prescriptions */}
                    <motion.div 
                      className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-6 shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                        <Pill className="w-6 h-6" />
                        Current Prescriptions
                      </h3>
                      <div className="space-y-2 text-base">
                        {formData.current_prescriptions.length > 0 ? (
                          formData.current_prescriptions.map((rx, idx) => (
                            <p key={idx} className="text-green-800">• {rx.name} - {rx.dosage}</p>
                          ))
                        ) : (
                          <p className="text-green-800">None added</p>
                        )}
                      </div>
                    </motion.div>

                    {/* Delivery Addresses */}
                    <motion.div 
                      className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-6 shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6" />
                        Delivery Addresses
                      </h3>
                      <div className="space-y-4 text-base">
                        {formData.addresses.map((addr, idx) => (
                          <div key={idx} className="text-orange-800">
                            <p><strong>{addr.name}:</strong> {addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ''}, {addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-sm">Delivery Days: {addr.delivery_days.length > 0 ? addr.delivery_days.join(', ') : 'Not set'}</p>
                            {addr.delivery_from && addr.delivery_to && (
                              <p className="text-sm">Delivery Period: {format(new Date(addr.delivery_from), 'MMM d, yyyy')} - {format(new Date(addr.delivery_to), 'MMM d, yyyy')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Emergency Contact */}
                    <motion.div 
                      className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-6 shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                        <Phone className="w-6 h-6" />
                        Emergency Contact
                      </h3>
                      <div className="space-y-2 text-base">
                        <p className="text-red-800"><strong>Name:</strong> {formData.emergency_contact_name}</p>
                        <p className="text-red-800"><strong>Phone:</strong> {formData.emergency_contact_phone}</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MFA Dialog */}
      {showMfaDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#8B1F1F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#8B1F1F]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Phone</h3>
              <p className="text-gray-600">
                A 6-digit code has been sent to<br />
                <span className="font-semibold">{formData.country_code} {formData.phone}</span>
              </p>
            </div>
            
            <div className="mb-6">
              <Label className="text-base font-semibold text-gray-700 mb-2 block">Enter 6-Digit Code</Label>
              <Input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="h-14 text-center text-2xl font-bold tracking-widest border-gray-200 focus:border-[#8B1F1F] focus:ring-[#8B1F1F]/20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMfaDialog(false)}
                className="flex-1 h-12 border-2 border-gray-300 hover:border-[#8B1F1F] hover:bg-[#8B1F1F]/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMfaSubmit}
                disabled={mfaCode.length !== 6}
                className="flex-1 h-12 bg-gradient-to-r from-[#8B1F1F] to-[#B52A2A] hover:from-[#721919] hover:to-[#8B1F1F] text-white"
              >
                Verify
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}