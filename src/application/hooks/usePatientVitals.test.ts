// @ts-nocheck
import { renderHook, act } from '@testing-library/react';
import usePatientVitals from './usePatientVitals';

describe('usePatientVitals Hook', () => {
  it('should initialize with default vitals', () => {
    const { result } = renderHook(() => usePatientVitals());

    expect(result.current.vitals.edad).toBe(0);
    expect(result.current.vitals.sexo).toBe('M');
    expect(result.current.vitals.presionSistolica).toBe(0);
    expect(result.current.vitals.temperatura).toBe(0);
  });

  it('should initialize with provided initial vitals', () => {
    const initialVitals = {
      edad: 45,
      sexo: 'M' as const,
      presionSistolica: 120,
    };

    const { result } = renderHook(() => usePatientVitals(initialVitals));

    expect(result.current.vitals.edad).toBe(45);
    expect(result.current.vitals.presionSistolica).toBe(120);
  });

  it('should update a single vital', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('edad', 45);
    });

    expect(result.current.vitals.edad).toBe(45);
  });

  it('should update multiple vitals at once', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVitals({
        edad: 45,
        presionSistolica: 160,
        temperatura: 38.5,
      });
    });

    expect(result.current.vitals.edad).toBe(45);
    expect(result.current.vitals.presionSistolica).toBe(160);
    expect(result.current.vitals.temperatura).toBe(38.5);
  });

  it('should validate age correctly', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('edad', 45);
    });

    const validation = result.current.validateVital('edad');
    expect(validation.valid).toBe(true);

    act(() => {
      result.current.updateVital('edad', 0);
    });

    const invalidValidation = result.current.validateVital('edad');
    expect(invalidValidation.valid).toBe(false);
  });

  it('should validate systolic pressure', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('presionSistolica', 120);
    });

    expect(result.current.validateVital('presionSistolica').valid).toBe(true);

    act(() => {
      result.current.updateVital('presionSistolica', 350);
    });

    expect(result.current.validateVital('presionSistolica').valid).toBe(false);
  });

  it('should validate temperature', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('temperatura', 37.5);
    });

    expect(result.current.validateVital('temperatura').valid).toBe(true);

    act(() => {
      result.current.updateVital('temperatura', 45);
    });

    expect(result.current.validateVital('temperatura').valid).toBe(false);
  });

  it('should validate O2 saturation', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('saturacionOxigeno', 98);
    });

    expect(result.current.validateVital('saturacionOxigeno').valid).toBe(true);

    act(() => {
      result.current.updateVital('saturacionOxigeno', 101);
    });

    expect(result.current.validateVital('saturacionOxigeno').valid).toBe(false);
  });

  it('should check if vitals are complete', () => {
    const { result } = renderHook(() => usePatientVitals());

    expect(result.current.isComplete()).toBe(false);

    act(() => {
      result.current.updateVitals({
        edad: 45,
        sexo: 'M',
        presionSistolica: 160,
        presionDiastolica: 95,
        frecuenciaCardiaca: 110,
        frecuenciaRespiratoria: 22,
        temperatura: 38.5,
        saturacionOxigeno: 94,
        nivelDolor: 7,
        tipoIncidente: 'Traumatismo',
        tiempoDesdeIncidente: 25,
      });
    });

    expect(result.current.isComplete()).toBe(true);
  });

  it('should get all validation errors', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVitals({
        edad: 0,
        presionSistolica: 400,
        temperatura: 50,
      });
    });

    const errors = result.current.getValidationErrors();
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });

  it('should calculate severity level for normal vitals', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVitals({
        edad: 45,
        presionSistolica: 120,
        presionDiastolica: 80,
        frecuenciaCardiaca: 70,
        frecuenciaRespiratoria: 16,
        temperatura: 37,
        saturacionOxigeno: 98,
        nivelDolor: 2,
        tipoIncidente: 'Leve',
        tiempoDesdeIncidente: 10,
      });
    });

    const severity = result.current.calculateSeverityLevel();
    expect(['BAJO', 'MEDIO']).toContain(severity);
  });

  it('should calculate severity level for critical vitals', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVitals({
        edad: 45,
        presionSistolica: 190,
        presionDiastolica: 110,
        frecuenciaCardiaca: 140,
        frecuenciaRespiratoria: 30,
        temperatura: 40,
        saturacionOxigeno: 85,
        nivelDolor: 9,
        tipoIncidente: 'Grave',
        tiempoDesdeIncidente: 5,
      });
    });

    const severity = result.current.calculateSeverityLevel();
    expect(['CRITICO', 'ALTO']).toContain(severity);
  });

  it('should get vital status indicators', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('presionSistolica', 120);
    });

    expect(result.current.getVitalStatus('presionSistolica')).toBe('normal');

    act(() => {
      result.current.updateVital('presionSistolica', 165);
    });

    expect(result.current.getVitalStatus('presionSistolica')).toBe('warning');

    act(() => {
      result.current.updateVital('presionSistolica', 190);
    });

    expect(result.current.getVitalStatus('presionSistolica')).toBe('critical');
  });

  it('should reset vitals to default', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVitals({
        edad: 45,
        presionSistolica: 160,
      });
    });

    expect(result.current.vitals.edad).toBe(45);

    act(() => {
      result.current.reset();
    });

    expect(result.current.vitals.edad).toBe(0);
    expect(result.current.vitals.presionSistolica).toBe(0);
  });

  it('should reset vitals to initial values', () => {
    const initialVitals = {
      edad: 50,
      presionSistolica: 130,
    };

    const { result } = renderHook(() => usePatientVitals(initialVitals));

    act(() => {
      result.current.updateVitals({
        edad: 45,
        presionSistolica: 160,
      });
    });

    act(() => {
      result.current.resetToInitial();
    });

    expect(result.current.vitals.edad).toBe(50);
    expect(result.current.vitals.presionSistolica).toBe(130);
  });

  it('should identify oxygen saturation as critical', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('saturacionOxigeno', 85);
    });

    expect(result.current.getVitalStatus('saturacionOxigeno')).toBe('critical');
  });

  it('should identify oxygen saturation as warning', () => {
    const { result } = renderHook(() => usePatientVitals());

    act(() => {
      result.current.updateVital('saturacionOxigeno', 93);
    });

    expect(result.current.getVitalStatus('saturacionOxigeno')).toBe('warning');
  });
});
