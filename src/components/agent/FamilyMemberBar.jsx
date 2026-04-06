import React, { useState } from 'react';
import { Users, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FamilyMemberBar({ familyMembers, onSwitchPatient }) {
  const [confirmMember, setConfirmMember] = useState(null);

  if (!familyMembers || familyMembers.length === 0) return null;

  return (
    <>
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 flex-shrink-0">
          <Users className="w-3.5 h-3.5" />
          Family Members
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {familyMembers.map(member => (
            <button
              key={member.id}
              onClick={() => setConfirmMember(member)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-semibold text-gray-800 shadow-sm"
            >
              {member.profile_picture ? (
                <img src={member.profile_picture} alt={member.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {member.name.charAt(0)}
                </div>
              )}
              {member.name}
              <span className="text-gray-400 font-normal">{member.relation}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Redirect Confirmation Popup */}
      {confirmMember && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmMember(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <button onClick={() => setConfirmMember(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Switch to Family Member?</h3>
            <p className="text-xs text-gray-500 mb-4">
              Would you like to redirect the workspace to{' '}
              <span className="font-semibold text-gray-800">{confirmMember.name}</span>'s profile?
            </p>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-5">
              {confirmMember.profile_picture ? (
                <img src={confirmMember.profile_picture} alt={confirmMember.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {confirmMember.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">{confirmMember.name}</p>
                <p className="text-xs text-gray-500">{confirmMember.email}</p>
                <p className="text-xs text-gray-400">{confirmMember.relation}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-xs h-9" onClick={() => setConfirmMember(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 text-xs h-9 bg-blue-600 hover:bg-blue-700"
                onClick={() => { onSwitchPatient(confirmMember); setConfirmMember(null); }}
              >
                <ArrowRight className="w-3.5 h-3.5 mr-1" />
                Switch Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}