'use client';

import React from 'react';
import { SiPaypal, SiVisa, SiMastercard, SiApple, SiGoogle, SiGmail, SiWhatsapp, SiFacebook, SiInstagram, SiX, SiLinkedin, SiYoutube, SiAmazon, SiShopify, SiStripe } from 'react-icons/si';
import { Icon } from '@iconify/react';

interface BrandIconProps {
  brand?: string | null;
  size?: number;
  className?: string;
}

const brandIcons: Record<string, React.ComponentType<any>> = {
  // Payment Methods (English)
  paypal: SiPaypal,
  visa: SiVisa,
  mastercard: SiMastercard,
  stripe: SiStripe,

  // Social Media (English)
  whatsapp: SiWhatsapp,
  facebook: SiFacebook,
  instagram: SiInstagram,
  twitter: SiX,
  x: SiX,
  linkedin: SiLinkedin,
  youtube: SiYoutube,

  // Tech Brands (English)
  apple: SiApple,
  google: SiGoogle,
  gmail: SiGmail,
  amazon: SiAmazon,
  shopify: SiShopify,
};

// Translation map for Spanish brand names to English keys
const brandNameTranslations: Record<string, string> = {
  // Payment Methods
  'tarjeta-de-crédito': 'credit-card',
  'tarjeta-de-débito': 'debit-card',
  'transferencia': 'bank-transfer',
  'efectivo': 'cash',
};

const iconifyIcons: Record<string, string> = {
  // Payment method icons via Iconify
  'credit-card': 'mdi:credit-card',
  'debit-card': 'mdi:credit-card-outline',
  'bank-transfer': 'mdi:bank-transfer',
  'cash': 'mdi:cash',

  // Fallback for Spanish names
  'tarjeta-de-crédito': 'mdi:credit-card',
  'tarjeta-de-débito': 'mdi:credit-card-outline',
  'transferencia': 'mdi:bank-transfer',
  'efectivo': 'mdi:cash',
};

export function BrandIcon({ brand, size = 24, className = '' }: BrandIconProps) {
  // Handle undefined or null brand
  if (!brand || typeof brand !== 'string') {
    console.log('BrandIcon: Invalid brand value:', brand);
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 rounded text-gray-600 font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        ?
      </div>
    );
  }

  const normalizedBrand = brand.toLowerCase().replace(/\s+/g, '-');
  console.log('BrandIcon: Processing brand:', brand, '-> normalized:', normalizedBrand);

  // Try translation first if it's a Spanish name
  const translatedBrand = brandNameTranslations[normalizedBrand] || normalizedBrand;
  console.log('BrandIcon: Translated brand:', normalizedBrand, '-> translated:', translatedBrand);

  // Try Simple Icons first (with both original and translated names)
  let SimpleIconComponent = brandIcons[normalizedBrand] || brandIcons[translatedBrand];
  console.log('BrandIcon: Found Simple Icon component for', normalizedBrand, ':', !!SimpleIconComponent);
  if (SimpleIconComponent) {
    return React.createElement(SimpleIconComponent, { size, className });
  }

  // Try Iconify (with both original and translated names)
  const iconifyIcon = iconifyIcons[normalizedBrand] || iconifyIcons[translatedBrand];
  console.log('BrandIcon: Found Iconify icon for', normalizedBrand, ':', iconifyIcon);
  if (iconifyIcon) {
    return <Icon icon={iconifyIcon} width={size} height={size} className={className} />;
  }

  // Fallback for text
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 rounded text-gray-600 font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {brand.charAt(0).toUpperCase()}
    </div>
  );
}