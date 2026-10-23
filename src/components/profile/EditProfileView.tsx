import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Camera,
  Upload,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { User } from '../../types/index.ts';
import { authService } from '../../services/auth-service.ts';

interface Props {
  user: User;
  onProfileUpdated: (updatedUser: User) => void;
  onCancel: () => void;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const EditProfileView: React.FC<Props> = ({
  user,
  onProfileUpdated,
  onCancel,
}) => {
  const [displayName, setDisplayName] = useState(user.name);
  const [previewImage, setPreviewImage] = useState<string>(user.customAvatarUrl || user.picture);
  const [hasNewCustomImage, setHasNewCustomImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger native file/gallery picker
  const handlePickFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image selected from device gallery / local file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (5MB max)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMsg(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller photo.`);
      return;
    }

    // Generate instant preview via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewImage(dataUrl);
      setHasNewCustomImage(true);
      setSuccessMsg('Photo selected! Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Restore default profile photo
  const handleRestoreDefault = () => {
    const defaultPic = user.googleSub
      ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=150`;

    setPreviewImage(defaultPic);
    setHasNewCustomImage(false);
    setSuccessMsg('Default avatar restored. Click "Save Changes" to confirm.');
  };

  // Submit changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Display name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: Partial<User> = {
        name: displayName.trim(),
        picture: previewImage,
        customAvatarUrl: hasNewCustomImage ? previewImage : undefined,
      };

      const updated = authService.updateProfile(user.id, updates);
      setIsSaving(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        onProfileUpdated(updated);
      }, 700);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Edit User Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update your display identity and choose a profile picture from your device gallery.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Back
        </button>
      </div>

      {/* Main Edit Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        
        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Circular Avatar with Camera badge */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group cursor-pointer" onClick={handlePickFile}>
              <img
                src={previewImage}
                alt={displayName}
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900 shadow-md group-hover:brightness-90 transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&size=150`;
                }}
              />
              <div className="absolute inset-0 rounded-full bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors"
                title="Change Photo"
                aria-label="Change photo from gallery"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Profile Photograph</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Choose a photo from your phone's gallery or computer files. Supports PNG, JPG, JPEG, and WebP up to 5MB.
              </p>

              {/* Hidden file input with gallery capture hint */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePickFile}
                  className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose from Gallery / Files</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreDefault}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Display Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address (Verified)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-mono cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Email address is permanently bound to your academic authentication record.
              </p>
            </div>

            {/* Role and Identity Info Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Account Role</span>
                <div className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{user.role}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Authentication Mode</span>
                <div className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                  {user.authProvider === 'google' ? 'Google OpenID Connect' : 'Email & Password'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
