"use client";

import DeviceCard from "../../components/DeviceCard";

export default function Home() {
  const handleRevoke = () => {
    // TODO: Implement revoke functionality
    console.log("Revoking device access...");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connected Devices</h1>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DeviceCard
          device={{
            id: '1',  
            name: 'Chrome - Windows',
            lastAccessed: new Date().toISOString(),
            browser: 'Chrome 120',
            os: 'Windows 11',
            ip: '192.168.1.1'
          }}
          onDelete={handleRevoke}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">New device connected</p>
                <p className="text-sm text-black">Chrome on Windows</p>
              </div>
              <span className="text-sm text-black">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
