import React, { useState } from 'react';
import { Users, Plus, Mail, Shield, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';

const ROLE_FEATURES = [
  { feature: 'View Communications', admin: true, representative: true },
  { feature: 'Respond to Patients', admin: true, representative: true },
  { feature: 'Generate AI Responses', admin: true, representative: true },
  { feature: 'Add Shared Notes', admin: true, representative: true },
  { feature: 'View Analytics', admin: true, representative: true },
  { feature: 'Manage AI Training', admin: true, representative: false },
  { feature: 'Create Workflows', admin: true, representative: false },
  { feature: 'Manage Knowledge Base', admin: true, representative: false },
  { feature: 'View Automation Queue', admin: true, representative: true },
  { feature: 'Manage Prescription Queue', admin: true, representative: true },
  { feature: 'Export Reports', admin: true, representative: false },
  { feature: 'Invite Team Members', admin: true, representative: false },
  { feature: 'Manage Team Settings', admin: true, representative: false },
  { feature: 'Access Settings', admin: true, representative: false }
];

const DUMMY_TEAM_MEMBERS = [
  { id: 1, name: 'Mike Allen', email: 'mike.allen@dcapharmacy.com', role: 'admin', status: 'active', invited_date: '2025-01-15' },
  { id: 2, name: 'Ben Myatt', email: 'ben.myatt@dcapharmacy.com', role: 'representative', status: 'active', invited_date: '2025-01-16' },
  { id: 3, name: 'Sarah Johnson', email: 'sarah.johnson@dcapharmacy.com', role: 'representative', status: 'active', invited_date: '2025-01-18' },
  { id: 4, name: 'David Chen', email: 'david.chen@dcapharmacy.com', role: 'representative', status: 'pending', invited_date: '2025-01-20' }
];

export default function TeamManagement() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleComparisonDialog, setShowRoleComparisonDialog] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'representative'
  });
  const [teamMembers, setTeamMembers] = useState(DUMMY_TEAM_MEMBERS);

  const handleInvite = async (e) => {
    e.preventDefault();
    
    // Simulate sending invite
    const newMember = {
      id: teamMembers.length + 1,
      name: inviteData.name,
      email: inviteData.email,
      role: inviteData.role,
      status: 'pending',
      invited_date: new Date().toISOString().split('T')[0]
    };

    setTeamMembers([...teamMembers, newMember]);

    // Simulate email send
    try {
      await base44.integrations.Core.SendEmail({
        to: inviteData.email,
        subject: 'Invitation to join DCA Pharmacy Communication Hub',
        body: `Hi ${inviteData.name},\n\nYou've been invited to join the DCA Pharmacy Patient Communication Hub as a ${inviteData.role}.\n\nClick here to accept your invitation and set up your account.\n\nBest regards,\nDCA Pharmacy Team`
      });
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invite:', error);
    }

    setInviteData({ email: '', name: '', role: 'representative' });
    setShowInviteDialog(false);
  };

  const handleRemoveMember = (memberId) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Team Management</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your team members and their access</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowRoleComparisonDialog(true)}
            variant="outline"
            className="border-gray-300"
          >
            <Shield className="w-4 h-4 mr-2" />
            View Permissions
          </Button>
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite Team Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Total Members</p>
          <p className="text-3xl font-bold text-gray-800">{teamMembers.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-3xl font-bold text-gray-800">
            {teamMembers.filter(m => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-gray-800">
            {teamMembers.filter(m => m.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invited</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map(member => (
              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white text-sm font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800">{member.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{member.email}</td>
                <td className="py-3 px-4">
                  <Badge className={member.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                    {member.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {member.role}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge className={member.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}>
                    {member.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{member.invited_date}</td>
                <td className="py-3 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team at DCA Pharmacy
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={inviteData.name}
                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="john.doe@dcapharmacy.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="representative">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Representative
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-800 mb-2 font-medium">
                {inviteData.role === 'admin' ? 'Admin' : 'Representative'} Permissions:
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                {inviteData.role === 'admin' ? (
                  <>
                    <li>• Full access to all features</li>
                    <li>• Manage AI training and workflows</li>
                    <li>• Invite and manage team members</li>
                    <li>• Export reports and analytics</li>
                  </>
                ) : (
                  <>
                    <li>• View and respond to communications</li>
                    <li>• Generate AI responses</li>
                    <li>• Add shared notes</li>
                    <li>• View analytics dashboard</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#8B1F1F] hover:bg-[#721919]">
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Comparison Dialog */}
      <Dialog open={showRoleComparisonDialog} onOpenChange={setShowRoleComparisonDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Permissions Comparison</DialogTitle>
            <DialogDescription>
              Compare features available to Admin and Representative roles
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 border-b border-r border-gray-200">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 border-b border-r border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Admin
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 border-b border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Representative
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROLE_FEATURES.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b border-r border-gray-200">
                      {item.feature}
                    </td>
                    <td className="py-3 px-4 text-center border-b border-r border-gray-200">
                      {item.admin ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center border-b border-gray-200">
                      {item.representative ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600" />
                Has Access
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <X className="w-4 h-4 text-red-400" />
                No Access
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}