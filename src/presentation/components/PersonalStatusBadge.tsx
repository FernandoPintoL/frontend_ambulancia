// @ts-nocheck
/**
 * PersonalStatusBadge Component
 * Presentation Layer - Badge with status and status change dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface PersonalStatusBadgeProps {
  status: 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones';
  onChangeStatus: (status: string) => void;
}

export default function PersonalStatusBadge({
  status,
  onChangeStatus,
}: PersonalStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statuses = [
    {
      value: 'disponible',
      label: 'Disponible',
      color: 'bg-green-100 text-green-700 border-green-300',
    },
    {
      value: 'en_servicio',
      label: 'En Servicio',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    {
      value: 'descanso',
      label: 'Descanso',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    },
    {
      value: 'vacaciones',
      label: 'Vacaciones',
      color: 'bg-purple-100 text-purple-700 border-purple-300',
    },
  ];

  const currentStatus = statuses.find((s) => s.value === status) || statuses[0];

  return (
    <div ref={dropdownRef} className="relative inline-block w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-full justify-between border ${currentStatus.color}`}
      >
        <span>{currentStatus.label}</span>
        <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onChangeStatus(s.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors text-sm ${
                s.value === status ? `${s.color} font-semibold` : ''
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
