'use client';

import { Github, Linkedin, Mail, Lock, Code2 } from 'lucide-react';

export function OpenSourceSection() {
  const features = [
    { name: 'Password Management', hosted: true, selfHosted: true },
    { name: 'Browser Extension', hosted: true, selfHosted: true },
    { name: 'Windows Hello Integration', hosted: true, selfHosted: true },
    { name: 'Zero-Knowledge Encryption', hosted: true, selfHosted: true },
    { name: 'Secure Key Generation', hosted: true, selfHosted: true },
    { name: 'Local Backup & Recovery', hosted: true, selfHosted: true },
    { name: 'Email-based Key Sharing', hosted: true, selfHosted: false },
    { name: 'Token Rotation', hosted: true, selfHosted: false },
    { name: 'Self-hosted Infrastructure', hosted: false, selfHosted: true },
    { name: 'Web Development knowledge', hosted: false, selfHosted: true },
  ];

  return (
    <section id="open-source" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Open Source
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              MePassword is fully committed to transparency and security. Our web application is completely open source, 
              allowing you to inspect and verify the code yourself. For the browser extension, we maintain a controlled 
              contribution process - simply submit a request for review, and I&apos;ll personally ensure all changes align 
              with our security standards.
            </p>

            {/* Version Information */}
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Version Comparison</h3>
              <div className="flex justify-center">
                <div className="max-w-6xl overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Feature
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          <a href="https://github.com/mouad-suuu/MePassword_web" 
                             target="_blank"
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 hover:text-primary">
                            <span>Hosted</span>
                            <Github className="h-4 w-4" />
                          </a>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          <a href="https://github.com/mouad-suuu/MePassword_web/tree/Version/Self-Deployment" 
                             target="_blank"
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 hover:text-primary">
                            <span>Self-Deployed</span>
                            <Github className="h-4 w-4" />
                          </a>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {features.map((feature, featureIdx) => (
                        <tr key={feature.name} className={featureIdx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">
                            {feature.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-300">
                            {feature.hosted ? '✓' : '×'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-300">
                            {feature.selfHosted ? '✓' : '×'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Self Deployment Note */}
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Self Deployment Options</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    You have the flexibility to either use our pre-built backend solution or create your own custom implementation. 
                    Detailed instructions for both approaches are available in our README file, making it easy to get started 
                    with your preferred setup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contribute & Connect</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Want to contribute, check the source code,request a features , or discuss improvements? 
                Let&apos;s connect and make MePassword even better together.
              </p>
              <div className="flex flex-col gap-4">
                <a href="mailto:mosd.menniui@gmail.com" 
                   className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </a>
                <a href="https://github.com/mouad-suuu" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Github className="h-5 w-5" />
                  <span>GitHub</span>
                </a>
                <a href="https://linkedin.com/in/mouad-mennioui-040477264" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Linkedin className="h-5 w-5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
