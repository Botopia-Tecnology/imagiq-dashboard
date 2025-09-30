'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

// PostHog configuration
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_demo_key';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

interface PostHogContextType {
  isInitialized: boolean;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  identifyUser: (userId: string, properties?: Record<string, any>) => void;
  getFeatureFlag: (flag: string) => boolean | string | undefined;
}

const PostHogContext = createContext<PostHogContextType | null>(null);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog initialized');
          }
          setIsInitialized(true);
        },
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        person_profiles: 'identified_only',
      });
    }

    return () => {
      if (typeof window !== 'undefined') {
        posthog.reset();
      }
    };
  }, []);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (isInitialized) {
      posthog.capture(eventName, {
        timestamp: new Date(),
        ...properties,
      });
    }
  };

  const identifyUser = (userId: string, properties?: Record<string, any>) => {
    if (isInitialized) {
      posthog.identify(userId, properties);
    }
  };

  const getFeatureFlag = (flag: string) => {
    if (isInitialized) {
      return posthog.getFeatureFlag(flag);
    }
    return undefined;
  };

  const contextValue: PostHogContextType = {
    isInitialized,
    trackEvent,
    identifyUser,
    getFeatureFlag,
  };

  return (
    <PostHogContext.Provider value={contextValue}>
      <PHProvider client={posthog}>
        {children}
      </PHProvider>
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
}