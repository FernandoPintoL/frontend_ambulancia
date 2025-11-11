// @ts-nocheck
import { useState, useCallback } from 'react';
import { DatosPaciente } from '../../data/repositories/decision-queries';

/**
 * Default/empty patient data
 */
const DEFAULT_VITALS: DatosPaciente = {
  edad: 0,
  sexo: 'M',
  presionSistolica: 0,
  presionDiastolica: 0,
  frecuenciaCardiaca: 0,
  frecuenciaRespiratoria: 0,
  temperatura: 0,
  saturacionOxigeno: 0,
  nivelDolor: 0,
  tipoIncidente: '',
  tiempoDesdeIncidente: 0,
};

/**
 * Custom Hook for Managing Patient Vital Signs
 * Provides state management and validation for patient data
 */
export function usePatientVitals(initialVitals?: Partial<DatosPaciente>) {
  const [vitals, setVitals] = useState<DatosPaciente>({
    ...DEFAULT_VITALS,
    ...initialVitals,
  });

  /**
   * Update a single vital
   */
  const updateVital = useCallback((key: keyof DatosPaciente, value: any) => {
    setVitals((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Update multiple vitals at once
   */
  const updateVitals = useCallback((updates: Partial<DatosPaciente>) => {
    setVitals((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Validate patient data for completeness
   */
  const isComplete = useCallback((): boolean => {
    return (
      vitals.edad > 0 &&
      vitals.presionSistolica > 0 &&
      vitals.presionDiastolica > 0 &&
      vitals.frecuenciaCardiaca > 0 &&
      vitals.frecuenciaRespiratoria > 0 &&
      vitals.temperatura > 0 &&
      vitals.saturacionOxigeno > 0 &&
      vitals.nivelDolor >= 0 &&
      vitals.tipoIncidente !== '' &&
      vitals.tiempoDesdeIncidente >= 0
    );
  }, [vitals]);

  /**
   * Validate individual vital ranges
   */
  const validateVital = useCallback(
    (key: keyof DatosPaciente): { valid: boolean; message?: string } => {
      const value = vitals[key];

      switch (key) {
        case 'edad':
          return Number(value) > 0 && Number(value) < 150 ? { valid: true } : { valid: false, message: 'Age must be between 1-150' };
        case 'presionSistolica':
          return Number(value) > 40 && Number(value) < 300 ? { valid: true } : { valid: false, message: 'Systolic pressure: 40-300' };
        case 'presionDiastolica':
          return Number(value) > 20 && Number(value) < 200 ? { valid: true } : { valid: false, message: 'Diastolic pressure: 20-200' };
        case 'frecuenciaCardiaca':
          return Number(value) > 30 && Number(value) < 200 ? { valid: true } : { valid: false, message: 'Heart rate: 30-200 bpm' };
        case 'frecuenciaRespiratoria':
          return Number(value) > 5 && Number(value) < 60 ? { valid: true } : { valid: false, message: 'Respiratory rate: 5-60' };
        case 'temperatura':
          return Number(value) >= 35 && Number(value) <= 42 ? { valid: true } : { valid: false, message: 'Temperature: 35-42 °C' };
        case 'saturacionOxigeno':
          return Number(value) >= 70 && Number(value) <= 100 ? { valid: true } : { valid: false, message: 'O2 Saturation: 70-100%' };
        case 'nivelDolor':
          return Number(value) >= 0 && Number(value) <= 10 ? { valid: true } : { valid: false, message: 'Pain level: 0-10' };
        case 'tiempoDesdeIncidente':
          return Number(value) >= 0 ? { valid: true } : { valid: false, message: 'Time must be positive' };
        default:
          return { valid: true };
      }
    },
    [vitals]
  );

  /**
   * Get all validation errors
   */
  const getValidationErrors = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const keys = Object.keys(vitals) as (keyof DatosPaciente)[];

    keys.forEach((key) => {
      const validation = validateVital(key);
      if (!validation.valid && validation.message) {
        errors[key] = validation.message;
      }
    });

    return errors;
  }, [vitals, validateVital]);

  /**
   * Reset to default vitals
   */
  const reset = useCallback(() => {
    setVitals(DEFAULT_VITALS);
  }, []);

  /**
   * Reset to initial vitals
   */
  const resetToInitial = useCallback(() => {
    setVitals({
      ...DEFAULT_VITALS,
      ...initialVitals,
    });
  }, [initialVitals]);

  /**
   * Calculate severity level based on vital signs (preliminary)
   */
  const calculateSeverityLevel = useCallback((): 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO' | 'UNKNOWN' => {
    // Simple preliminary assessment (should be validated by ms_decision)
    let riskScore = 0;

    // Systolic pressure risk
    if (vitals.presionSistolica > 180 || vitals.presionSistolica < 90) riskScore += 2;
    else if (vitals.presionSistolica > 160 || vitals.presionSistolica < 100) riskScore += 1;

    // Heart rate risk
    if (vitals.frecuenciaCardiaca > 120 || vitals.frecuenciaCardiaca < 40) riskScore += 2;
    else if (vitals.frecuenciaCardiaca > 100 || vitals.frecuenciaCardiaca < 60) riskScore += 1;

    // Oxygen saturation risk
    if (vitals.saturacionOxigeno < 90) riskScore += 3;
    else if (vitals.saturacionOxigeno < 95) riskScore += 2;

    // Temperature risk
    if (vitals.temperatura > 39 || vitals.temperatura < 36) riskScore += 2;
    else if (vitals.temperatura > 38.5 || vitals.temperatura < 36.5) riskScore += 1;

    // Pain level
    if (vitals.nivelDolor >= 8) riskScore += 2;
    else if (vitals.nivelDolor >= 6) riskScore += 1;

    if (riskScore >= 8) return 'CRITICO';
    if (riskScore >= 5) return 'ALTO';
    if (riskScore >= 2) return 'MEDIO';
    return 'BAJO';
  }, [vitals]);

  /**
   * Get vital status indicator (normal, warning, critical)
   */
  const getVitalStatus = useCallback(
    (key: keyof DatosPaciente): 'normal' | 'warning' | 'critical' => {
      const value = vitals[key];

      switch (key) {
        case 'presionSistolica':
          if (Number(value) > 180 || Number(value) < 90) return 'critical';
          if (Number(value) > 160 || Number(value) < 100) return 'warning';
          return 'normal';
        case 'frecuenciaCardiaca':
          if (Number(value) > 120 || Number(value) < 40) return 'critical';
          if (Number(value) > 100 || Number(value) < 60) return 'warning';
          return 'normal';
        case 'saturacionOxigeno':
          if (Number(value) < 90) return 'critical';
          if (Number(value) < 95) return 'warning';
          return 'normal';
        case 'temperatura':
          if (Number(value) > 39 || Number(value) < 36) return 'critical';
          if (Number(value) > 38.5 || Number(value) < 36.5) return 'warning';
          return 'normal';
        case 'nivelDolor':
          if (Number(value) >= 8) return 'critical';
          if (Number(value) >= 6) return 'warning';
          return 'normal';
        default:
          return 'normal';
      }
    },
    [vitals]
  );

  return {
    // State
    vitals,

    // Methods
    updateVital,
    updateVitals,
    isComplete,
    validateVital,
    getValidationErrors,
    reset,
    resetToInitial,
    calculateSeverityLevel,
    getVitalStatus,
  };
}

export default usePatientVitals;
