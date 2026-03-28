import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  LogOut,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';

interface NotificationSettings {
  emailAlerts: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  performanceAlerts: boolean;
}

export const Settings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const email = user?.email || '';
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    dailyDigest: false,
    weeklyReport: true,
    performanceAlerts: true,
  });
  
  // UI state
  const [activeSection, setActiveSection] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser({ name });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      setSaveStatus('error');
      return;
    }
    
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      setSaveStatus('error');
      return;
    }
    
    setSaveStatus('saving');
    try {
      // Simulate API call - in real implementation, call backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage('Failed to change password');
    }
  };

  const handleSaveNotifications = async () => {
    setSaveStatus('saving');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <>
      <Header 
        title="Settings" 
        subtitle="Manage your account and preferences"
      />
      
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <Card className="p-2">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      {section.label}
                    </button>
                  ))}
                  
                  <hr className="my-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </nav>
              </Card>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white text-2xl font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-sm text-gray-500">{email}</p>
                      </div>
                    </div>
                    
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Email Field (read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saveStatus === 'saving'}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : saveStatus === 'saved' ? (
                          <>
                            <Check className="w-4 h-4" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Account Status</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-8">Your account is secure and active</p>
                    </div>
                    
                    <h4 className="font-medium text-gray-900">Change Password</h4>
                    
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    {/* Error Message */}
                    {saveStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errorMessage}
                      </div>
                    )}
                    
                    {/* Save Button */}
                    <button
                      onClick={handleChangePassword}
                      disabled={!currentPassword || !newPassword || !confirmPassword || saveStatus === 'saving'}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saveStatus === 'saving' ? 'Updating...' : saveStatus === 'saved' ? 'Password Updated!' : 'Update Password'}
                    </button>
                  </div>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive important updates via email' },
                      { key: 'dailyDigest', label: 'Daily Digest', description: 'Get a summary of daily metrics every morning' },
                      { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive comprehensive weekly performance reports' },
                      { key: 'performanceAlerts', label: 'Performance Alerts', description: 'Get notified when metrics fall below threshold' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(prev => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof NotificationSettings]
                          }))}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                            notifications[item.key as keyof NotificationSettings]
                              ? 'bg-primary-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                              notifications[item.key as keyof NotificationSettings]
                                ? 'translate-x-5'
                                : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleSaveNotifications}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mt-4"
                    >
                      {saveStatus === 'saved' ? (
                        <>
                          <Check className="w-4 h-4" />
                          Preferences Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              )}

              {/* Appearance Section */}
              {activeSection === 'appearance' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="font-medium text-gray-900 mb-4">Theme</p>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'light', label: 'Light', active: true },
                          { id: 'dark', label: 'Dark', active: false },
                          { id: 'system', label: 'System', active: false },
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              theme.active
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-12 rounded mb-2 ${
                              theme.id === 'light' ? 'bg-white border border-gray-200' :
                              theme.id === 'dark' ? 'bg-gray-800' :
                              'bg-gradient-to-r from-white to-gray-800'
                            }`} />
                            <p className="text-sm font-medium text-center">{theme.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Dark mode and system theme are coming soon!
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
