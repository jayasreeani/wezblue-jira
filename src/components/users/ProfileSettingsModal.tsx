'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, Camera, Lock, Eye, EyeOff, Shield, Check, 
  Upload, Sparkles, Building, Briefcase, Mail, User as UserIcon 
} from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/types';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', // Jayasree
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Althaf
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', // Binsitha
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', // Abhijith
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', // Ramees
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', // Vineeth
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Female Exec
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // Generic Dev
];

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { currentUser, updateCurrentUserProfile, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [name, setName] = useState(currentUser.name || '');
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image file size must be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        showToast('Image loaded! Click "Save Changes" to apply.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'security' || newPassword) {
      if (!currentPassword) {
        showToast('Please enter your current password to proceed', 'error');
        return;
      }
      if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New password and confirmation do not match', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await updateCurrentUserProfile({
        name,
        avatar,
        jobTitle,
        department,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success) {
        showToast(
          newPassword 
            ? 'Profile and password updated successfully!' 
            : 'Profile details and avatar updated!', 
          'success'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating settings', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-jira-border w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-jira-border flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-jira-brand flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-jira-text leading-tight">My Profile & Security Settings</h2>
              <p className="text-xs text-jira-subtle mt-0.5">Manage your personal information, corporate avatar, and password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-jira-border px-6 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'profile'
                ? 'border-jira-brand text-jira-brand bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Profile & Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'security'
                ? 'border-jira-brand text-jira-brand bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Password & Security</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'profile' ? (
            <>
              {/* Avatar Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-slate-700">Corporate Avatar Picture</label>
                
                <div className="flex items-center space-x-5">
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Upload photo"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-jira-brand" />
                        <span>Upload From Computer</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">Supports JPG, PNG, GIF or WebP (max 2MB).</p>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Or Choose from Team Preset Avatars:
                  </span>
                  <div className="flex items-center space-x-2.5 overflow-x-auto py-1">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(preset)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition flex-shrink-0 ${
                          avatar === preset ? 'border-jira-brand ring-2 ring-blue-400/50 scale-105' : 'border-transparent hover:scale-105'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Image URL */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Or paste custom image URL:</label>
                  <input
                    type="url"
                    value={avatar.startsWith('data:') ? '' : avatar}
                    onChange={e => setAvatar(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-jira-brand"
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-jira-brand outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      placeholder="e.g. Project Manager"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-jira-brand outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Project Management"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-jira-brand outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email (Read-Only)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enterprise Role</label>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${ROLE_COLORS[currentUser.role] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                      {ROLE_LABELS[currentUser.role] || currentUser.role}
                    </span>
                    <span className="text-[11px] text-slate-400 italic">
                      (Assigned by workspace Admin)
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Security & Password Section */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Corporate Password Policy:</span>
                  <p className="mt-0.5">
                    Your initial default corporate password is <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">Wezblue@123</code>.
                    Enter it below along with your desired new password to update your login credentials.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password (e.g. Wezblue@123)"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-jira-brand outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-jira-brand outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-jira-brand outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Changes apply instantly across all sessions.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
