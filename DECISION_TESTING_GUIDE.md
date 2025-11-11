# MS Decision Frontend - Testing Guide

## Test Overview

This document provides comprehensive testing guidelines for the ms_decision frontend integration, including unit tests, integration tests, and manual testing procedures.

## Test Files Created

### 1. Unit Tests for useDecisionRecommendation Hook
**File:** `src/application/hooks/useDecisionRecommendation.test.ts`

**Test Coverage:**
- ✓ Default state initialization
- ✓ Patient severity evaluation (success case)
- ✓ Patient severity evaluation (error handling)
- ✓ Hospital recommendations retrieval
- ✓ Error state management
- ✓ State reset functionality
- ✓ Cluster information retrieval
- ✓ System statistics retrieval

**Test Cases (8 total):**

```typescript
1. should initialize with default state
   - Verifies: loading = false, error = null, evaluacion = null
   - Expected: All state properties initialized to default values

2. should evaluate patient severity successfully
   - Input: Patient vitals (age: 45, systolic BP: 160, etc.)
   - Expected: evaluacion object populated with severity level and probabilities
   - Mock Response: { severidad: 'ALTO', confianza: 0.89, ... }

3. should handle evaluation error
   - Input: API returns error
   - Expected: error property populated, evaluacion remains null
   - Error Message: 'Failed to evaluate patient'

4. should recommend hospitals successfully
   - Input: Patient vitals + location coordinates
   - Expected: recomendaciones object with hospital list
   - Mock Response: Array of 5 hospitals with distances and capacity

5. should clear error state
   - Action: Call clearError() after error occurs
   - Expected: error property becomes null

6. should reset all state
   - Action: Call reset() after successful evaluation
   - Expected: All state properties return to default values

7. should handle cluster retrieval
   - Expected: clusters array populated with cluster data

8. should handle statistics retrieval
   - Expected: estadisticas object with system metrics
```

### 2. Unit Tests for usePatientVitals Hook
**File:** `src/application/hooks/usePatientVitals.test.ts`

**Test Coverage:**
- ✓ Default initialization
- ✓ Initialization with initial values
- ✓ Single vital update
- ✓ Multiple vitals update
- ✓ Validation for each vital sign
- ✓ Completeness check
- ✓ Error collection
- ✓ Severity level calculation
- ✓ Status indicators
- ✓ Reset functionality

**Test Cases (26 total):**

```typescript
1. should initialize with default vitals
   - Expected: All vitals = 0 or empty

2. should initialize with provided initial vitals
   - Input: { edad: 45, presionSistolica: 120 }
   - Expected: Vitals set to provided values

3. should update a single vital
   - Action: updateVital('edad', 45)
   - Expected: edad = 45, others unchanged

4. should update multiple vitals at once
   - Action: updateVitals({ edad: 45, presionSistolica: 160, ... })
   - Expected: All provided vitals updated

5-10. Validation Tests (Age, Systolic, Diastolic, HR, RR, Temperature, O2)
   - Test valid ranges for each vital
   - Test invalid ranges return error messages

11. should check if vitals are complete
   - Input: All vitals provided
   - Expected: isComplete() = true

12. should get all validation errors
   - Input: Multiple invalid vitals
   - Expected: errors object with all failures

13. should calculate severity for normal vitals
   - Input: All vitals in normal ranges
   - Expected: severityLevel = 'BAJO' or 'MEDIO'

14. should calculate severity for critical vitals
   - Input: Multiple vitals in critical ranges
   - Expected: severityLevel = 'CRITICO' or 'ALTO'

15-19. Vital Status Indicator Tests
   - Test normal, warning, and critical thresholds
   - For: BP, HR, O2 saturation, Temperature, Pain level

20. should reset vitals to default
   - Action: reset()
   - Expected: All vitals return to 0

21. should reset vitals to initial values
   - Action: resetToInitial()
   - Expected: Vitals return to initially provided values

22-26. Advanced Status Tests
   - Edge cases for boundary values
   - Interaction between multiple vitals
```

## Running the Tests

### Option 1: Run All Decision Tests
```bash
cd frontend
npm test -- --testPathPattern="Decision|Vitals" --watch
```

### Option 2: Run Specific Test File
```bash
npm test -- useDecisionRecommendation.test.ts --watch
npm test -- usePatientVitals.test.ts --watch
```

### Option 3: Run Tests with Coverage
```bash
npm test -- --coverage --testPathPattern="Decision|Vitals"
```

### Option 4: Run in CI Mode (No Watch)
```bash
npm test -- --testPathPattern="Decision|Vitals" --ci --coverage
```

## Manual Integration Testing

### Prerequisites
1. Start ms_decision service:
   ```bash
   cd ms_decision
   python iniciar_servidor.py
   ```

2. Start Apollo Gateway with decision enabled:
   ```bash
   cd apollo-gateway
   ENABLED_SERVICES="recepcion,decision" npm start
   ```

3. Start frontend dev server:
   ```bash
   cd frontend
   npm start
   ```

### Test Scenario 1: Basic Severity Evaluation

**Steps:**
1. Navigate to any incident detail page
2. Click "Expandir" on "Soporte de Decisión Clínica" section
3. Fill in sample patient data:
   - Age: 45
   - Gender: Male
   - Systolic BP: 120 mmHg
   - Diastolic BP: 80 mmHg
   - Heart Rate: 75 bpm
   - Respiratory Rate: 16
   - Temperature: 37°C
   - O2 Saturation: 98%
   - Pain Level: 2/10
   - Incident Type: "Accidente Leve"
   - Time Since Incident: 10 minutes

4. Click "Evaluar Severidad"

**Expected Results:**
- Loading spinner appears during evaluation
- Severity evaluation card displays: BAJO
- Confidence score shows ~95-100%
- Probability distribution shows:
  - Crítico: <5%
  - Alto: <10%
  - Medio: 10-20%
  - Bajo: 70%+

**Pass Criteria:**
- No errors in browser console
- Severity matches expected level
- Toast notification shows success message

### Test Scenario 2: Elevated Vitals Evaluation

**Steps:**
1. Follow steps 1-2 from Scenario 1
2. Fill in elevated vital signs:
   - Age: 45
   - Systolic BP: 160 mmHg (elevated)
   - Diastolic BP: 95 mmHg (elevated)
   - Heart Rate: 110 bpm (elevated)
   - Respiratory Rate: 22 (slightly elevated)
   - Temperature: 38.5°C (fever)
   - O2 Saturation: 94% (slightly low)
   - Pain Level: 7/10
   - Other fields as normal

3. Click "Evaluar Severidad"

**Expected Results:**
- Severity evaluation card displays: ALTO or CRITICO
- Confidence score shows 80-90%
- Probability distribution shows:
  - Crítico: 10-25%
  - Alto: 60-75%
  - Medio: 10-15%
  - Bajo: <5%

**Pass Criteria:**
- Severity matches elevated status
- Color coding changes to red/orange in component
- User can proceed to hospital recommendations

### Test Scenario 3: Hospital Recommendations

**Steps:**
1. Complete Scenario 2 (elevated vitals evaluation)
2. Click "Obtener Recomendaciones de Hospitales"
3. Wait for API response

**Expected Results:**
- Hospital recommendation card displays
- Shows 3-5 hospitals in list
- Each hospital shows:
  - Hospital name
  - Distance from incident (km)
  - Capacity percentage with status indicator
  - Level classification (I-IV)
  - Action buttons (Directions, Call)

**Pass Criteria:**
- Hospitals ranked by distance
- Nearest hospital is marked as #1 recommendation
- All capacity percentages are valid (0-100%)
- Map view toggle works correctly

### Test Scenario 4: Map View

**Steps:**
1. From hospital recommendations card
2. Click "Map View" button

**Expected Results:**
- Google Map loads with hospital markers
- Incident location shown in red
- Hospital locations shown in blue
- Clicking marker selects hospital
- Distance information updates correctly

**Pass Criteria:**
- Map loads without errors
- Markers display correctly
- Marker selection updates sidebar info
- "Get Directions" button works

### Test Scenario 5: Error Handling - Incomplete Vitals

**Steps:**
1. Expand Clinical Decision Support section
2. Leave several vital sign fields empty
3. Click "Evaluar Severidad"

**Expected Results:**
- Error toast appears: "Por favor, ingresa los signos vitales del paciente"
- No API call is made
- Loading state doesn't appear

**Pass Criteria:**
- Error message is clear
- Form prevents incomplete submission

### Test Scenario 6: Error Handling - Invalid Coordinates

**Steps:**
1. Use an incident with no location data
2. Complete severity evaluation (vitals are OK)
3. Click "Obtener Recomendaciones de Hospitales"

**Expected Results:**
- Error toast appears: "La ubicación del incidente no tiene coordenadas válidas"
- No API call is made

**Pass Criteria:**
- User gets feedback about missing location
- System handles gracefully

### Test Scenario 7: Collapsible Panel

**Steps:**
1. Open Clinical Decision Support section
2. Fill in patient vitals
3. Click "Contraer" button
4. Click "Expandir" button again

**Expected Results:**
- Panel collapses, hiding all input fields and results
- Click expand shows all previous data is preserved
- User can collapse/expand without losing data

**Pass Criteria:**
- State persists across collapse/expand
- Panel responsive and smooth animation
- No data loss

### Test Scenario 8: Vital Sign Validation Feedback

**Steps:**
1. Expand Clinical Decision Support section
2. Enter invalid values:
   - Age: 200 (too high)
   - Temperature: 45 (too high)
   - O2 Saturation: 101 (too high)

**Expected Results:**
- Invalid fields show visual feedback
- Validation messages appear
- Submit button is disabled or shows warning

**Pass Criteria:**
- Users cannot submit invalid data
- Clear validation messages
- Helpful feedback for correction

## Expected Test Results Summary

### Unit Tests
- **useDecisionRecommendation:** 8/8 tests pass
- **usePatientVitals:** 26/26 tests pass
- **Total Unit Tests:** 34/34 passing
- **Code Coverage Target:** >80%

### Integration Tests
- **Severity Evaluation:** ✓ Pass
- **Hospital Recommendations:** ✓ Pass
- **Map Integration:** ✓ Pass
- **Error Handling:** ✓ Pass
- **Validation:** ✓ Pass

## Performance Testing

### Expected Response Times
- Severity Evaluation: 1-2 seconds
- Hospital Recommendations: 2-3 seconds
- Map Loading: <1 second

### Load Testing
- Concurrent API calls: 10+
- No memory leaks with repeated evaluations
- Component cleanup on unmount

## Troubleshooting Common Test Issues

### Issue: Tests timeout
**Solution:** Check that ms_decision service is running on port 8002

### Issue: Mock data not working
**Solution:** Verify jest mock setup in test file headers

### Issue: Component not updating in tests
**Solution:** Wrap state updates in `act()` block

### Issue: GraphQL queries not found
**Solution:** Ensure decision-queries.ts file exists and is imported correctly

## Regression Testing Checklist

Before deploying, verify:
- [ ] All unit tests pass
- [ ] No console errors or warnings
- [ ] Severity levels calculated correctly
- [ ] Hospital recommendations show valid data
- [ ] Map displays without errors
- [ ] Validation prevents invalid submissions
- [ ] Error messages are helpful
- [ ] UI is responsive on mobile devices
- [ ] Accessibility features work (keyboard nav, screen readers)
- [ ] No performance degradation

## Continuous Integration

### GitHub Actions / CI Pipeline

```yaml
- name: Run Decision Tests
  run: npm test -- --testPathPattern="Decision|Vitals" --ci --coverage

- name: Check Coverage
  run: npm test -- --coverage --testPathPattern="Decision|Vitals"
```

### Required Coverage Thresholds
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 80%
- **Lines:** 80%

## Support & Debugging

### Enable Debug Logging
```typescript
// In useDecisionRecommendation.ts
console.log('Evaluating patient:', datosPaciente);
console.log('API Response:', data);
console.log('Error:', error);
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by GraphQL requests
4. Inspect request/response payloads

### Apollo DevTools Extension
- Install React DevTools browser extension
- Use Apollo DevTools to inspect GraphQL operations
- Verify query variables and responses

## Test Execution Summary

**Total Test Files:** 2
**Total Test Cases:** 34
**Expected Pass Rate:** 100%
**Estimated Runtime:** 30-60 seconds

---

For more information, see MS_DECISION_FRONTEND_INTEGRATION.md
