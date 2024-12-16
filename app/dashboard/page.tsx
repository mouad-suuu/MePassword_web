'use client';

import { useUser, useAuth, useClerk, SignOutButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { CyberPattern } from '../../components/ui/CyberPattern';
import { Laptop, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { TopNav } from '../../components/navigation/TopNavDashboard';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation'; 



interface Device {
  id: string;
  browser: string;
  os: string;
  deviceName?: string;
  lastActive: string;
  sessionActive: boolean;
  source: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionIds, setSessionIds] = useState<string[]>([]);

  const { signOut } = useClerk();

  // In your component:
  const router = useRouter();  

const handleSignOutAllDevices = async () => {
  try {
    // Signs out from all sessions with options
    await signOut({
      redirectUrl: '/'
    });
    router.push('/');
  } catch (err) {
    console.error("Error signing out from all devices:", err);
  }
};
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get device information
        const userAgent = window.navigator.userAgent;
        const browser = getBrowserInfo(userAgent);
        const os = getOSInfo(userAgent);

        const token = await getToken();
        if (!token || !user?.id) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/devices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Device-Browser': browser,
            'X-Device-OS': os,
            'X-Request-Source': 'web',
            'X-User-ID': user.id
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch devices');
        }

        const data = await response.json();
        setDevices(data.devices);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch devices');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDevices();
    }
  }, [user?.id, getToken]);

  // Helper function to get browser info
  const getBrowserInfo = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  // Helper function to get OS info
  const getOSInfo = (userAgent: string): string => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown OS';
  };

  const getDeviceIcon = (device: Device) => {
    const os = device.os.toLowerCase();
    if (os.includes('android') || os.includes('ios')) return <Smartphone className="w-5 h-5" />;
    if (os.includes('ipad') || os.includes('tablet')) return <Tablet className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  const getDeviceName = (device: Device) => {
    if (device.deviceName) return device.deviceName;
    return `${device.browser} on ${device.os}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-r from-white via-white to-white/90 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90" />
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-purple-600/30" />
      <CyberPattern />

      {/* Content */}
      <div className="relative flex flex-col min-h-screen">
        <header className="py-6 px-8">
          <TopNav />
        </header>

        <main className="flex-grow px-8 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Combined Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
              {/* User Profile Section */}
              <div className="flex flex-col items-center pt-12 pb-8 px-8 border-b border-gray-200 dark:border-gray-700">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || ''}
                  className="w-24 h-24 rounded-full border-4 border-primary shadow-lg mb-4"
                />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{user.emailAddresses[0]?.emailAddress}</p>
                <div className="grid grid-cols-2 gap-8 mt-6 text-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Access</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Devices Section */}
              <div className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Devices Connected to your account</h2>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center py-4">{error}</div>
                ) : devices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Device</th>
                          <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Last Access</th>
                          <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                          <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devices.map((device) => (
                          <tr key={device.id} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="text-primary">{getDeviceIcon(device)}</div>
                                <span className="text-gray-900 dark:text-white">{getDeviceName(device)}</span>
                              </div>
                            </td>
                            <td className="py-4 text-gray-500 dark:text-gray-400">
                              {new Date(device.lastActive).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.sessionActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                }`}>
                                {device.sessionActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-4 text-gray-500 dark:text-gray-400">
                              {device.source || 'Unknown'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <SignOutButton>
                    <Button
                      variant="destructive"
                      size="sm"
                      // onClick={handleSignOutAllDevices}
                      className="w-full mt-4"
                    >
                      Sign Out All Devices
                    </Button></SignOutButton>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No devices found</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
