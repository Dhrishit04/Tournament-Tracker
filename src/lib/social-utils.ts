'use client';

import { Instagram, Github, Twitter, AtSign, Linkedin, Youtube, Facebook, Mail, Globe, type LucideIcon } from 'lucide-react';

interface PlatformInfo {
  platform: string;
  icon: LucideIcon;
  label: string;
}

const PLATFORM_MATCHERS: { test: (url: string) => boolean; platform: string; icon: LucideIcon; label: string }[] = [
  { test: (url) => url.includes('instagram.com'), platform: 'instagram', icon: Instagram, label: 'Instagram' },
  { test: (url) => url.includes('github.com'), platform: 'github', icon: Github, label: 'GitHub' },
  { test: (url) => url.includes('x.com') || url.includes('twitter.com'), platform: 'x', icon: Twitter, label: 'X' },
  { test: (url) => url.includes('threads.net'), platform: 'threads', icon: AtSign, label: 'Threads' },
  { test: (url) => url.includes('linkedin.com'), platform: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { test: (url) => url.includes('youtube.com') || url.includes('youtu.be'), platform: 'youtube', icon: Youtube, label: 'YouTube' },
  { test: (url) => url.includes('facebook.com') || url.includes('fb.com'), platform: 'facebook', icon: Facebook, label: 'Facebook' },
  { test: (url) => url.startsWith('mailto:') || (url.includes('@') && !url.includes('/')), platform: 'email', icon: Mail, label: 'Email' },
];

// Auto-detect platform from a URL string and return icon + metadata
export function detectPlatform(url: string): PlatformInfo {
  const lower = url.toLowerCase().trim();
  for (const matcher of PLATFORM_MATCHERS) {
    if (matcher.test(lower)) {
      return { platform: matcher.platform, icon: matcher.icon, label: matcher.label };
    }
  }
  return { platform: 'website', icon: Globe, label: 'Website' };
}

// Auto-detect platform name from a URL (returns the platform string only)
export function detectPlatformName(url: string): string {
  return detectPlatform(url).platform;
}

// Get the appropriate href for a social link (add mailto: for email if needed)
export function getSocialHref(url: string): string {
  const info = detectPlatform(url);
  if (info.platform === 'email' && !url.startsWith('mailto:')) {
    return `mailto:${url}`;
  }
  if (!url.startsWith('http') && info.platform !== 'email') {
    return `https://${url}`;
  }
  return url;
}
