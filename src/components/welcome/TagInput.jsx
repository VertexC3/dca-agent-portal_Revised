import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function TagInput({ value = [], onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="border border-gray-300 rounded-lg p-2 min-h-[100px] focus-within:ring-2 focus-within:ring-[#8B1F1F] focus-within:border-[#8B1F1F]">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge key={index} className="bg-[#8B1F1F] text-white flex items-center gap-1 px-2 py-1">
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="hover:bg-[#721919] rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : 'Type and press comma...'}
        className="border-none shadow-none focus-visible:ring-0 p-0"
      />
      <p className="text-xs text-gray-500 mt-1">Press comma or enter to add items</p>
    </div>
  );
}