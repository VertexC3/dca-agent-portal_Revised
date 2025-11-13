import React, { useState } from 'react';
import { Download, Share2, FileText, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const TEAM_MEMBERS = [
  { name: 'Mike Allen', email: 'mike.allen@dcapharmacy.com' },
  { name: 'Ben Myatt', email: 'ben.myatt@dcapharmacy.com' }
];

export default function ExportShareButtons({ data, filename = 'export' }) {
  const [emailInput, setEmailInput] = useState('');
  const [isEmailFormVisible, setIsEmailFormVisible] = useState(false);
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShareViaEmail = async (recipientEmail) => {
    try {
      const shareUrl = window.location.href;
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `DCA Pharmacy - Communication Data Shared`,
        body: `A team member has shared communication data with you.\n\nView here: ${shareUrl}\n\nData Summary:\n${JSON.stringify(data, null, 2)}`
      });
      alert(`Successfully shared with ${recipientEmail}`);
      setEmailInput('');
      setIsEmailFormVisible(false);
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share via email');
    }
  };

  const handleCustomEmailShare = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      handleShareViaEmail(emailInput);
    }
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border-gray-200">
          <DropdownMenuItem onClick={handleExportCSV} className="text-gray-700 cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON} className="text-gray-700 cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-[#8B1F1F] hover:bg-[#721919] text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 bg-white border-gray-200 p-3">
          {/* Email Form */}
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Share via Email</p>
            <form onSubmit={handleCustomEmailShare} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="text-sm"
              />
              <Button type="submit" size="sm" className="bg-[#8B1F1F] hover:bg-[#721919]">
                <Mail className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <DropdownMenuSeparator />

          {/* Team Members */}
          <p className="text-xs font-semibold text-gray-500 mb-2 mt-2">SHARE WITH TEAM</p>
          {TEAM_MEMBERS.map((member, idx) => (
            <DropdownMenuItem
              key={idx}
              onClick={() => handleShareViaEmail(member.email)}
              className="cursor-pointer text-gray-700 hover:bg-gray-100"
            >
              <User className="w-4 h-4 mr-2" />
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}