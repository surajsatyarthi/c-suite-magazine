'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ISO_COUNTRY_CODES } from '../lib/countries';

// Helper function to get country flag emoji from code
export function getCountryFlag(countryCode: string): string {
  // Convert ISO alpha-2 code to flag emoji via regional indicators
  try {
    const code = countryCode.trim().toUpperCase();
    if (code.length !== 2) return '🇺🇸';
    const codePoints = [code.charCodeAt(0), code.charCodeAt(1)].map((c) => 127397 + c);
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🇺🇸';
  }
}

interface CountrySelectorProps {
  currentCountry: string;
  onCountryChange: (countryCode: string) => void;
  className?: string;
}

export default function CountrySelector({ 
  currentCountry, 
  onCountryChange, 
  className = '' 
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build full country list once (names via Intl.DisplayNames)
  const COUNTRIES: { code: string; name: string; flag: string }[] = useMemo(() => {
    const display = new Intl.DisplayNames(['en'], { type: 'region' });
    return ISO_COUNTRY_CODES.map((code) => {
      const name = (display.of(code) || code) as string;
      return { code, name, flag: getCountryFlag(code) };
    });
  }, []);

  const handleCountrySelect = (countryCode: string) => {
    onCountryChange(countryCode);
    setIsOpen(false);
  };

  const currentFlag = getCountryFlag(currentCountry);
  const currentCountryName = COUNTRIES.find(c => c.code === currentCountry)?.name || currentCountry;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Flag Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-1.5 py-1 text-white hover:text-[#f4d875] active:text-[#ffffff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945] rounded-sm"
        title={`Current location: ${currentCountryName} (Click to change)`}
        aria-label={`Current location: ${currentCountryName}. Click to change location.`}
      >
        <span className="text-xl sm:text-2xl leading-none" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.6)' }}>
          {currentFlag}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl 
                        border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => handleCountrySelect(country.code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3
                         transition-colors ${
                           country.code === currentCountry ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                         }`}
            >
              <span className="text-lg">{country.flag}</span>
              <span className="text-sm font-medium">{country.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{country.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
