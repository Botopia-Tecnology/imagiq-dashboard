'use client';

import React from 'react';
import { SiWhatsapp, SiPaypal, SiGoogle, SiApple, SiFacebook, SiInstagram, SiX } from 'react-icons/si';
import { BrandIcon } from './BrandIcon';

export function IconTest() {
  const testBrands = [
    'WhatsApp',
    'PayPal',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'Efectivo',
    'Google',
    'Apple',
    'Facebook',
    'Instagram'
  ];

  return (
    <div className="space-y-8">
      {/* Direct Simple Icons Test */}
      <div className="p-6 bg-white border rounded-lg">
        <h3 className="text-lg font-bold mb-4">Test Directo - Simple Icons</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2">
            <SiWhatsapp size={32} className="text-green-500" />
            <span className="text-xs">WhatsApp (Direct)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <SiPaypal size={32} className="text-blue-500" />
            <span className="text-xs">PayPal (Direct)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <SiGoogle size={32} className="text-red-500" />
            <span className="text-xs">Google (Direct)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <SiApple size={32} className="text-gray-800" />
            <span className="text-xs">Apple (Direct)</span>
          </div>
        </div>
      </div>

      {/* BrandIcon Component Test */}
      <div className="p-6 bg-gray-50 border rounded-lg">
        <h3 className="text-lg font-bold mb-4">Test BrandIcon Component</h3>
        <div className="grid grid-cols-5 gap-4">
          {testBrands.map((brand) => (
            <div key={brand} className="flex flex-col items-center gap-2">
              <BrandIcon brand={brand} size={32} className="text-blue-600" />
              <span className="text-xs text-center">{brand}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Console Debug Info */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Debug Info</h4>
        <p className="text-sm text-yellow-700">
          Abre las herramientas de desarrollador (F12) y ve la consola para ver los logs de debugging del componente BrandIcon.
        </p>
      </div>
    </div>
  );
}