"use client";

import Link from "next/link";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section id="home" className="py-20 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
          Secure Password Management
          <span className="block text-blue-600">Made Simple</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Open-source password manager that puts your security first. Store,
          generate, and manage your passwords with complete privacy.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <a
            href="https://chromewebstore.google.com/detail/jggifpaolmnjgglibehjichnhhpbblcg?utm_source=item-share-cp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </a>
          <Link
            href="#features"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-gray-200 dark:border-gray-700"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
