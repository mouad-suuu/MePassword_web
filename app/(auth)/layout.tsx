'use client';

import { motion } from 'framer-motion';
import { RiLockPasswordLine, RiShieldLine } from 'react-icons/ri';
import { TbWorldShare } from 'react-icons/tb';
import { HiUserGroup } from 'react-icons/hi';
import { CyberPattern } from '../../components/ui/CyberPattern';
import { Logo } from '../../components/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-r from-white via-white to-white/90 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90" />
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-purple-600/30" />
      <CyberPattern />
      
      {/* Content - highest layer */}
      <div className="relative py-12">
        {/* Mobile Welcome Text */}
        <div className="xl:hidden p-6 pb-0 text-center">
          <motion.div 
            className="text-2xl font-bold mb-4 mt-8 text-gray-800 dark:text-white inline-flex items-center gap-3"
            {...fadeIn}
          >
            Welcome to MePassword
            <Logo/>
          </motion.div>
          <motion.p 
            className="text-xl mb-6 text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your secure, open-source password management solution.
          </motion.p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col xl:flex-row min-h-[calc(100vh-6rem)]">
          {/* Auth Component Container */}
          <div className="w-full xl:w-[65%] flex items-center justify-center p-4 xl:p-16">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>

          {/* Features Section */}
          <div className="w-full xl:w-[65%] p-4 xl:p-16 flex flex-col justify-center">
            <div className="max-w-2xl mx-auto">
              <div className="hidden xl:block mb-16">
                <motion.div 
                  className="text-6xl font-bold mb-6 text-gray-800 dark:text-white inline-flex items-center gap-3"
                  {...fadeIn}
                >
                  Welcome to MePassword
                  <Logo/>
                </motion.div>
                <motion.p 
                  className="text-2xl mb-12 text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Your secure, open-source password management solution.
                </motion.p>
              </div>

              <motion.div 
                className="space-y-6 px-8 xl:px-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center gap-6 text-xl text-gray-800 dark:text-white pl-4 xl:pl-0">
                  <RiLockPasswordLine className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Free and open-source password manager</span>
                </div>
                <div className="flex items-center gap-6 text-xl text-gray-800 dark:text-white pl-4 xl:pl-0">
                  <RiShieldLine className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Built with state-of-the-art security practices</span>
                </div>
                <div className="flex items-center gap-6 text-xl text-gray-800 dark:text-white pl-4 xl:pl-0">
                  <TbWorldShare className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Seamless browser extension integration</span>
                </div>
                <div className="flex items-center gap-6 text-xl text-gray-800 dark:text-white pl-4 xl:pl-0">
                  <HiUserGroup className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Join our community and help shape the future of password management</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
