import React, { useState } from 'react';
import { Plus, X, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Drug database with generic, brand, and category
const drugDatabase = {
  // Blood pressure
  'amlodipine': { brand: 'Norvasc', category: 'Blood Pressure' },
  'norvasc': { generic: 'Amlodipine', category: 'Blood Pressure' },
  'lisinopril': { brand: 'Prinivil', category: 'Blood Pressure' },
  'prinivil': { generic: 'Lisinopril', category: 'Blood Pressure' },
  'losartan': { brand: 'Cozaar', category: 'Blood Pressure' },
  'cozaar': { generic: 'Losartan', category: 'Blood Pressure' },
  'metoprolol tartrate': { brand: 'Lopressor', category: 'Blood Pressure' },
  'lopressor': { generic: 'Metoprolol Tartrate', category: 'Blood Pressure' },
  'metoprolol succinate': { brand: 'Toprol XL', category: 'Blood Pressure' },
  'toprol xl': { generic: 'Metoprolol Succinate', category: 'Blood Pressure' },
  'propranolol': { brand: 'Inderal', category: 'Blood Pressure' },
  'inderal': { generic: 'Propranolol', category: 'Blood Pressure' },
  'hydrochlorothiazide': { brand: 'Microzide', category: 'Blood Pressure' },
  'microzide': { generic: 'Hydrochlorothiazide', category: 'Blood Pressure' },
  'furosemide': { brand: 'Lasix', category: 'Blood Pressure' },
  'lasix': { generic: 'Furosemide', category: 'Blood Pressure' },
  
  // Cholesterol
  'atorvastatin': { brand: 'Lipitor', category: 'Cholesterol' },
  'lipitor': { generic: 'Atorvastatin', category: 'Cholesterol' },
  'simvastatin': { brand: 'Zocor', category: 'Cholesterol' },
  'zocor': { generic: 'Simvastatin', category: 'Cholesterol' },
  'rosuvastatin': { brand: 'Crestor', category: 'Cholesterol' },
  'crestor': { generic: 'Rosuvastatin', category: 'Cholesterol' },
  
  // Diabetes and thyroid
  'metformin': { brand: 'Glucophage', category: 'Diabetes' },
  'glucophage': { generic: 'Metformin', category: 'Diabetes' },
  'glipizide': { brand: 'Glucotrol', category: 'Diabetes' },
  'glucotrol': { generic: 'Glipizide', category: 'Diabetes' },
  'sitagliptin': { brand: 'Januvia', category: 'Diabetes' },
  'januvia': { generic: 'Sitagliptin', category: 'Diabetes' },
  'insulin glargine': { brand: 'Lantus', category: 'Diabetes' },
  'lantus': { generic: 'Insulin Glargine', category: 'Diabetes' },
  'levothyroxine': { brand: 'Synthroid', category: 'Thyroid' },
  'synthroid': { generic: 'Levothyroxine', category: 'Thyroid' },
  
  // Stomach/acid
  'omeprazole': { brand: 'Prilosec', category: 'Stomach/Acid' },
  'prilosec': { generic: 'Omeprazole', category: 'Stomach/Acid' },
  'pantoprazole': { brand: 'Protonix', category: 'Stomach/Acid' },
  'protonix': { generic: 'Pantoprazole', category: 'Stomach/Acid' },
  'esomeprazole': { brand: 'Nexium', category: 'Stomach/Acid' },
  'nexium': { generic: 'Esomeprazole', category: 'Stomach/Acid' },
  
  // Pain, inflammation, muscle
  'acetaminophen': { brand: 'Tylenol', category: 'Pain Relief' },
  'tylenol': { generic: 'Acetaminophen', category: 'Pain Relief' },
  'ibuprofen': { brand: 'Advil', category: 'Pain Relief' },
  'advil': { generic: 'Ibuprofen', category: 'Pain Relief' },
  'naproxen': { brand: 'Naprosyn', category: 'Pain Relief' },
  'naprosyn': { generic: 'Naproxen', category: 'Pain Relief' },
  'tramadol': { brand: 'Ultram', category: 'Pain Relief' },
  'ultram': { generic: 'Tramadol', category: 'Pain Relief' },
  'hydrocodone/acetaminophen': { brand: 'Vicodin', category: 'Pain Relief' },
  'vicodin': { generic: 'Hydrocodone/Acetaminophen', category: 'Pain Relief' },
  'oxycodone/acetaminophen': { brand: 'Percocet', category: 'Pain Relief' },
  'percocet': { generic: 'Oxycodone/Acetaminophen', category: 'Pain Relief' },
  'cyclobenzaprine': { brand: 'Flexeril', category: 'Muscle Relaxant' },
  'flexeril': { generic: 'Cyclobenzaprine', category: 'Muscle Relaxant' },
  
  // Infection
  'amoxicillin': { brand: 'Amoxil', category: 'Antibiotic' },
  'amoxil': { generic: 'Amoxicillin', category: 'Antibiotic' },
  'azithromycin': { brand: 'Zithromax', category: 'Antibiotic' },
  'zithromax': { generic: 'Azithromycin', category: 'Antibiotic' },
  'doxycycline': { brand: 'Vibramycin', category: 'Antibiotic' },
  'vibramycin': { generic: 'Doxycycline', category: 'Antibiotic' },
  'cephalexin': { brand: 'Keflex', category: 'Antibiotic' },
  'keflex': { generic: 'Cephalexin', category: 'Antibiotic' },
  
  // Mental health
  'sertraline': { brand: 'Zoloft', category: 'Mental Health' },
  'zoloft': { generic: 'Sertraline', category: 'Mental Health' },
  'fluoxetine': { brand: 'Prozac', category: 'Mental Health' },
  'prozac': { generic: 'Fluoxetine', category: 'Mental Health' },
  'escitalopram': { brand: 'Lexapro', category: 'Mental Health' },
  'lexapro': { generic: 'Escitalopram', category: 'Mental Health' },
  'citalopram': { brand: 'Celexa', category: 'Mental Health' },
  'celexa': { generic: 'Citalopram', category: 'Mental Health' },
  'bupropion': { brand: 'Wellbutrin', category: 'Mental Health' },
  'wellbutrin': { generic: 'Bupropion', category: 'Mental Health' },
  'trazodone': { brand: 'Desyrel', category: 'Mental Health' },
  'desyrel': { generic: 'Trazodone', category: 'Mental Health' },
  'quetiapine': { brand: 'Seroquel', category: 'Mental Health' },
  'seroquel': { generic: 'Quetiapine', category: 'Mental Health' },
  'aripiprazole': { brand: 'Abilify', category: 'Mental Health' },
  'abilify': { generic: 'Aripiprazole', category: 'Mental Health' },
  'zolpidem': { brand: 'Ambien', category: 'Sleep Aid' },
  'ambien': { generic: 'Zolpidem', category: 'Sleep Aid' },
  
  // Anxiety/seizures
  'alprazolam': { brand: 'Xanax', category: 'Anxiety' },
  'xanax': { generic: 'Alprazolam', category: 'Anxiety' },
  'lorazepam': { brand: 'Ativan', category: 'Anxiety' },
  'ativan': { generic: 'Lorazepam', category: 'Anxiety' },
  'clonazepam': { brand: 'Klonopin', category: 'Anxiety' },
  'klonopin': { generic: 'Clonazepam', category: 'Anxiety' },
  'gabapentin': { brand: 'Neurontin', category: 'Neuropathic Pain' },
  'neurontin': { generic: 'Gabapentin', category: 'Neuropathic Pain' },
  'pregabalin': { brand: 'Lyrica', category: 'Neuropathic Pain' },
  'lyrica': { generic: 'Pregabalin', category: 'Neuropathic Pain' },
  
  // Allergy/asthma
  'albuterol': { brand: 'Ventolin HFA', category: 'Asthma' },
  'ventolin hfa': { generic: 'Albuterol', category: 'Asthma' },
  'montelukast': { brand: 'Singulair', category: 'Asthma' },
  'singulair': { generic: 'Montelukast', category: 'Asthma' },
  'fluticasone': { brand: 'Flonase', category: 'Allergy' },
  'flonase': { generic: 'Fluticasone', category: 'Allergy' },
  'cetirizine': { brand: 'Zyrtec', category: 'Allergy' },
  'zyrtec': { generic: 'Cetirizine', category: 'Allergy' },
  'fexofenadine': { brand: 'Allegra', category: 'Allergy' },
  'allegra': { generic: 'Fexofenadine', category: 'Allergy' },
  
  // Other
  'tadalafil': { brand: 'Cialis', category: 'Other' },
  'cialis': { generic: 'Tadalafil', category: 'Other' },
};

export default function PrescriptionInput({ value = [], onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState({
    name: '',
    genericName: '',
    brandName: '',
    category: '',
    dosage: ''
  });

  const handleNameChange = (name) => {
    const lowerName = name.toLowerCase().trim();
    const drugInfo = drugDatabase[lowerName];
    
    if (drugInfo) {
      setCurrentPrescription({
        ...currentPrescription,
        name,
        genericName: drugInfo.generic || name,
        brandName: drugInfo.brand || name,
        category: drugInfo.category
      });
    } else {
      setCurrentPrescription({
        ...currentPrescription,
        name,
        genericName: '',
        brandName: '',
        category: ''
      });
    }
  };

  const handleAdd = () => {
    if (currentPrescription.name && currentPrescription.dosage) {
      onChange([...value, currentPrescription]);
      setCurrentPrescription({ name: '', genericName: '', brandName: '', category: '', dosage: '' });
      setShowForm(false);
    }
  };

  const handleRemove = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((prescription, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{prescription.name}</p>
                  {prescription.genericName && prescription.brandName && (
                    <p className="text-xs text-gray-600">
                      Generic: {prescription.genericName} | Brand: {prescription.brandName}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Dosage: {prescription.dosage}</p>
                  {prescription.category && (
                    <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                      {prescription.category}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prescription
        </Button>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div>
            <Label className="text-sm">Medication Name *</Label>
            <Input
              value={currentPrescription.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter generic or brand name..."
              className="mt-1"
            />
            {currentPrescription.category && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Recognized as {currentPrescription.category}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm">Dosage *</Label>
            <Input
              value={currentPrescription.dosage}
              onChange={(e) => setCurrentPrescription({ ...currentPrescription, dosage: e.target.value })}
              placeholder="e.g., 10mg once daily"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setCurrentPrescription({ name: '', genericName: '', brandName: '', category: '', dosage: '' });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!currentPrescription.name || !currentPrescription.dosage}
              className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}