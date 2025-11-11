# MS Decision - Frontend Integration Guide

## Overview

The ms_decision microservice has been successfully integrated into the frontend with Apollo Federation. This document provides a complete guide to the implementation, usage, and testing of the clinical decision support features.

## Architecture

### Data Flow

```
IncidenteDetallesPage
    ↓
[Patient Vitals Input]
    ↓
useDecisionRecommendation Hook
    ↓
GraphQL Request → Apollo Gateway
    ↓
ms_decision Microservice (port 8002)
    ↓
Response with Severity & Recommendations
    ↓
SeverityEvaluation Component
HospitalRecommendationCard Component
```

## Files Created

### 1. GraphQL Queries (`src/data/repositories/decision-queries.ts`)

Defines all GraphQL queries and types for ms_decision integration:

**Queries:**
- `EVALUATE_PATIENT_QUERY` - Evaluate patient severity
- `RECOMMEND_HOSPITALS_QUERY` - Get hospital recommendations
- `GET_CLUSTERS_QUERY` - Retrieve hospital clusters
- `GET_SYSTEM_STATISTICS_QUERY` - System performance metrics

**Type Definitions:**
- `DatosPaciente` - Patient vital signs
- `Ubicacion` - Geographic location
- `Evaluacion` - Severity evaluation result
- `RecomendacionHospitales` - Hospital recommendations
- `HospitalRecomendado` - Individual hospital recommendation
- `ClusterInfo` - Hospital cluster information
- `EstadisticasSistema` - System statistics
- `Probabilidades` - Severity probability distribution

### 2. Custom Hook (`src/application/hooks/useDecisionRecommendation.ts`)

Manages decision support API interactions:

**State:**
- `loading` - Request in progress
- `error` - Error message
- `evaluacion` - Current severity evaluation
- `recomendaciones` - Current hospital recommendations
- `clusters` - Hospital cluster data
- `estadisticas` - System statistics

**Methods:**
- `evaluarPaciente(datosPaciente)` - Evaluate patient severity
- `recomendarHospitales(datosPaciente, ubicacionPaciente, topN)` - Get recommendations
- `obtenerClusters()` - Fetch cluster information
- `obtenerEstadisticas()` - Fetch system statistics
- `clearError()` - Clear error state
- `reset()` - Reset all state

### 3. Patient Vitals Hook (`src/application/hooks/usePatientVitals.ts`)

Manages patient vital sign data and validation:

**State:**
- `vitals` - Current vital signs data

**Methods:**
- `updateVital(key, value)` - Update single vital
- `updateVitals(updates)` - Update multiple vitals
- `isComplete()` - Check if data is complete
- `validateVital(key)` - Validate individual vital range
- `getValidationErrors()` - Get all validation errors
- `calculateSeverityLevel()` - Preliminary severity assessment
- `getVitalStatus(key)` - Get status indicator (normal/warning/critical)
- `reset()` - Reset to default vitals
- `resetToInitial()` - Reset to initial vitals

**Vital Signs Tracked:**
- Age (edad) - 1-150 years
- Gender (sexo) - M/F
- Systolic Pressure (presionSistolica) - 40-300 mmHg
- Diastolic Pressure (presionDiastolica) - 20-200 mmHg
- Heart Rate (frecuenciaCardiaca) - 30-200 bpm
- Respiratory Rate (frecuenciaRespiratoria) - 5-60 breaths/min
- Temperature (temperatura) - 35-42 °C
- O2 Saturation (saturacionOxigeno) - 70-100%
- Pain Level (nivelDolor) - 0-10 scale
- Incident Type (tipoIncidente) - Free text
- Time Since Incident (tiempoDesdeIncidente) - Minutes

### 4. Severity Evaluation Component (`src/presentation/components/SeverityEvaluation.tsx`)

Displays severity assessment results:

**Props:**
- `evaluacion` - Evaluation result
- `loading` - Loading state
- `error` - Error message
- `onRetry` - Retry callback

**Features:**
- Color-coded severity levels (Critical/High/Medium/Low)
- Confidence score with visual progress bar
- Probability distribution visualization
- Status indicators (Requires transfer / Local care)
- Responsive design with Tailwind CSS

**Severity Levels:**
- **CRÍTICO (Critical)** - Red, requires immediate transfer
- **ALTO (High)** - Orange, urgent care needed
- **MEDIO (Medium)** - Yellow, monitored care
- **BAJO (Low)** - Green, standard care

### 5. Hospital Recommendation Component (`src/presentation/components/HospitalRecommendationCard.tsx`)

Displays hospital recommendations with map and list views:

**Props:**
- `recomendaciones` - Hospital recommendations
- `loading` - Loading state
- `error` - Error message
- `onRetry` - Retry callback
- `userLocation` - Patient location coordinates

**Features:**
- Dual view mode: List and Map
- Hospital ranking by recommendation priority
- Distance calculation from incident location
- Real-time capacity indicators
- Color-coded hospital levels (I-IV)
- Integration with Google Maps
- Direct navigation links
- Emergency contact features

**Hospital Information Displayed:**
- Hospital name and address
- Level classification (I-IV)
- Distance from incident (km)
- Current capacity percentage
- Availability status
- Specialties (from cluster data)

### 6. Enhanced Incident Detail Page (`src/presentation/pages/IncidenteDetallesPage.tsx`)

Integrated decision support section with:

**New Sections:**
- Patient vital signs input form
- Severity evaluation interface
- Hospital recommendations interface
- Expandable/collapsible decision panel

**New Components Imported:**
- `useDecisionRecommendation` hook
- `usePatientVitals` hook
- `SeverityEvaluation` component
- `HospitalRecommendationCard` component

**Workflow:**
1. Open incident detail page
2. Expand "Soporte de Decisión Clínica" section
3. Enter patient vital signs
4. Click "Evaluar Severidad" button
5. Review severity assessment
6. Click "Obtener Recomendaciones de Hospitales"
7. View recommended hospitals on map or list

## Usage Example

### Basic Patient Evaluation

```tsx
import { IncidenteDetallesPage } from './pages/IncidenteDetallesPage';

// User navigates to incident detail page
// Expands Clinical Decision Support section
// Enters vital signs for a 45-year-old patient:
// - Age: 45
// - Gender: M
// - Systolic BP: 160 mmHg (elevated - warning)
// - Diastolic BP: 95 mmHg (elevated - warning)
// - Heart Rate: 110 bpm (elevated - warning)
// - Respiratory Rate: 22 (slightly elevated)
// - Temperature: 38.5°C (fever - warning)
// - O2 Saturation: 94% (slightly low - warning)
// - Pain Level: 7/10 (significant)
// - Incident Type: "Traumatismo Craneoencefálico"
// - Time Since Incident: 25 minutes

// System evaluates and displays:
// Severity: ALTO (High Risk)
// Confidence: 89.5%
// Requires Transfer: Yes
// Probability Distribution:
//   - Critical: 15.2%
//   - High: 68.3%
//   - Medium: 14.8%
//   - Low: 1.7%

// User clicks "Obtener Recomendaciones de Hospitales"
// System recommends 5 hospitals:
// 1. Hospital San José (2.3 km away, 85% capacity, Level III)
// 2. Clínica del Occidente (3.8 km away, 92% capacity, Level III)
// 3. Hospital Simón Bolívar (5.1 km away, 78% capacity, Level II)
// 4. Clínica La Sagrada Familia (6.2 km away, 88% capacity, Level III)
// 5. Hospital de San Blas (7.5 km away, 65% capacity, Level I)
```

### Integration with Incident Management

```tsx
// When approving an incident with clinical recommendations:
1. Check severity assessment
2. Verify hospital availability
3. Consider patient location
4. Review hospital level and specialties
5. Document decision in incident notes
6. Process dispatch with recommended hospital
```

## Environment Configuration

### Required Environment Variables

```bash
# .env file
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

### Apollo Gateway Configuration

The Apollo Gateway must be started with ms_decision enabled:

```bash
cd apollo-gateway

# Start with decision service enabled
ENABLED_SERVICES="recepcion,decision" npm start

# Or with environment variable
export ENABLED_SERVICES=recepcion,decision
npm start
```

## API Integration Details

### GraphQL Query Structure

```graphql
query EvaluarPaciente($datosPaciente: DatosPacienteInput!) {
  evaluarPaciente(datosPaciente: $datosPaciente) {
    severidad
    confianza
    requiereTraslado
    probabilidades {
      critico
      alto
      medio
      bajo
    }
  }
}
```

### Query Variables Example

```json
{
  "datosPaciente": {
    "edad": 45,
    "sexo": "M",
    "presionSistolica": 160,
    "presionDiastolica": 95,
    "frecuenciaCardiaca": 110,
    "frecuenciaRespiratoria": 22,
    "temperatura": 38.5,
    "saturacionOxigeno": 94,
    "nivelDolor": 7,
    "tipoIncidente": "Traumatismo",
    "tiempoDesdeIncidente": 25
  }
}
```

## Component Integration Points

### In IncidenteDetallesPage

The decision support section is integrated as an expandable panel in the main content area:

**Location:** After location map, before sidebar
**Layout:** Full-width responsive design
**State Management:** Local component state for panel expansion
**Data Flow:** useDecisionRecommendation hook manages API calls

## Testing Guide

### Manual Testing Workflow

1. **Start Services:**
   ```bash
   # Terminal 1: Start ms_decision
   cd ms_decision
   python iniciar_servidor.py

   # Terminal 2: Start Apollo Gateway
   cd apollo-gateway
   ENABLED_SERVICES="recepcion,decision" npm start

   # Terminal 3: Start Frontend
   cd frontend
   npm start
   ```

2. **Test Evaluation:**
   - Navigate to any incident detail page
   - Expand "Soporte de Decisión Clínica" section
   - Enter sample vital signs
   - Click "Evaluar Severidad"
   - Verify severity level, confidence, and probabilities appear

3. **Test Hospital Recommendations:**
   - After successful evaluation
   - Click "Obtener Recomendaciones de Hospitales"
   - Verify hospital list appears with distances
   - Toggle between List and Map views
   - Test navigation links to Google Maps

4. **Error Handling:**
   - Test with incomplete vital signs (should show error)
   - Test with invalid coordinates (should show error)
   - Verify error messages are clear and actionable

### Unit Testing Example

```typescript
import { renderHook, act } from '@testing-library/react';
import useDecisionRecommendation from './useDecisionRecommendation';

describe('useDecisionRecommendation', () => {
  it('should evaluate patient severity', async () => {
    const { result } = renderHook(() => useDecisionRecommendation());

    const vitals = {
      edad: 45,
      sexo: 'M' as const,
      presionSistolica: 160,
      presionDiastolica: 95,
      frecuenciaCardiaca: 110,
      frecuenciaRespiratoria: 22,
      temperatura: 38.5,
      saturacionOxigeno: 94,
      nivelDolor: 7,
      tipoIncidente: 'Traumatismo',
      tiempoDesdeIncidente: 25,
    };

    await act(async () => {
      await result.current.evaluarPaciente(vitals);
    });

    expect(result.current.evaluacion).toBeDefined();
    expect(result.current.evaluacion?.severidad).toBe('ALTO');
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Evaluation:** Only fetch hospital recommendations after severity evaluation
2. **Memoization:** Components use React.memo for unnecessary re-renders
3. **Conditional Rendering:** Decision panel is collapsible to reduce initial load
4. **Debouncing:** Input changes are debounced before API calls
5. **Caching:** Consider caching cluster and statistics data

### Expected Response Times

- Severity Evaluation: 1-2 seconds (ML model inference)
- Hospital Recommendations: 2-3 seconds (clustering + distance calculation)
- System Statistics: < 500ms

## Troubleshooting

### Common Issues

**Issue:** GraphQL query returns "field not found" error
**Solution:** Ensure ms_decision is enabled in Apollo Gateway with ENABLED_SERVICES environment variable

**Issue:** Hospital coordinates show as invalid
**Solution:** Verify incident location has valid latitude/longitude values

**Issue:** Severity evaluation returns "internal server error"
**Solution:** Check ms_decision logs for MongoDB connection or model loading issues

**Issue:** Map view doesn't load hospitals
**Solution:** Ensure Google Maps API key is configured in REACT_APP_GOOGLE_API_KEY

### Debug Mode

Enable verbose logging:
```typescript
// In useDecisionRecommendation.ts, uncomment:
console.log('Evaluating patient:', datosPaciente);
console.log('API Response:', data);
```

## Future Enhancements

- [ ] Save severity evaluations to incident history
- [ ] Trend analysis across multiple evaluations
- [ ] Integration with EHR systems
- [ ] Advanced filtering for hospital recommendations
- [ ] Custom severity evaluation models
- [ ] Real-time hospital bed availability
- [ ] SMS notifications for critical cases
- [ ] Mobile app support
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1)

## Support

### Resources

- **ms_decision Documentation:** See MS_DECISION_INTEGRATION.md
- **Google Maps Integration:** See GOOGLE_MAPS_INTEGRATION.md
- **Apollo Federation Docs:** https://www.apollographql.com/docs/apollo-server/federation/
- **React Documentation:** https://react.dev

### Contact

For issues or questions:
1. Check browser console for JavaScript errors
2. Review Apollo Gateway logs for GraphQL errors
3. Verify ms_decision is running on port 8002
4. Check network tab in DevTools for API calls
5. Review error messages in toast notifications

## Version History

- **v1.0** (Current) - Initial frontend integration with ms_decision
  - Patient vital signs input
  - Severity evaluation interface
  - Hospital recommendations with map view
  - Integrated into IncidenteDetallesPage

## License

This integration is part of the incident management system and follows the same license.
