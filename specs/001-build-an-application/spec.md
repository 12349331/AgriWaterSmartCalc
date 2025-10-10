# Feature Specification: Agricultural Water Usage Estimator

**Feature Branch**: `001-build-an-application`
**Created**: 2025-10-08
**Status**: Draft
**Input**: User description: "Build an application for Taiwanese farmers to estimate agricultural water usage from electricity data. It takes inputs like crop type, electricity use, and area to calculate water flow (Q) and total monthly usage (V). The app features a dashboard with data visualization charts and persistently saves a table of past estimations."

## Clarifications

### Session 2025-10-08

- Q: What specific crop types should be available for selection? → A: Rice, vegetables (leafy greens, root vegetables), fruit trees (citrus, mango) - 5-8 categories
- Q: How should the application handle data persistence across devices? → A: Single device only - data stays on one browser/device, no cross-device access
- Q: What units should be used for displaying water flow rate (Q) and monthly volume (V)? → A: Q in liters/second, V in cubic meters (m³) - standard metric flow/volume units
- Q: What are the acceptable input ranges for validation? → A: Electricity: 10-5,000 kWh, Area: 0.5-50 hectares - medium-sized farms only
- Q: How should the application behave when used offline? → A: Online-only - show "No connection" message, disable all functionality when offline

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Calculate Water Usage from Current Data (Priority: P1)

A farmer wants to estimate their water consumption based on their current electricity usage, crop type, and field area to understand their resource consumption and plan irrigation budgets.

**Why this priority**: This is the core value proposition - providing immediate, actionable water usage estimates. Without this, the application has no purpose.

**Independent Test**: Can be fully tested by entering electricity data, crop type, and area into a calculation form and receiving water flow (Q) and total monthly usage (V) results. Delivers immediate value as a standalone calculator.

**Acceptance Scenarios**:

1. **Given** a farmer has their electricity meter reading, crop type, and field area, **When** they enter this data into the estimation form, **Then** the system displays calculated water flow rate (Q) and total monthly water volume (V)
2. **Given** a farmer enters invalid data (negative numbers, non-numeric values), **When** they attempt to calculate, **Then** the system displays clear error messages indicating which fields need correction
3. **Given** a farmer enters partial data (missing crop type or area), **When** they attempt to calculate, **Then** the system prevents calculation and highlights required fields
4. **Given** a farmer completes a calculation, **When** they want to perform another estimation, **Then** the form resets while preserving crop type selection for convenience

---

### User Story 2 - View Historical Estimation Records (Priority: P2)

A farmer wants to review their past water usage estimations to track consumption patterns over time, compare different periods, and identify trends in their water usage.

**Why this priority**: Historical data enables farmers to make informed decisions about irrigation practices and resource management. Builds on P1 by adding persistence and analysis capabilities.

**Independent Test**: Can be tested by saving multiple estimations and viewing them in a table format. Delivers value by providing a historical record independent of the visualization features.

**Acceptance Scenarios**:

1. **Given** a farmer has completed multiple water usage calculations, **When** they navigate to the history view, **Then** they see a table showing all past estimations with date, crop type, area, electricity usage, and calculated water values
2. **Given** a farmer is viewing their estimation history, **When** they want to find specific records, **Then** they can sort the table by date, crop type, or water usage values
3. **Given** a farmer has estimation records, **When** they restart the application, **Then** all previously saved estimations are still available
4. **Given** a farmer has many historical records, **When** viewing the table, **Then** the records are displayed in chronological order (most recent first)

---

### User Story 3 - Visualize Usage Trends (Priority: P3)

A farmer wants to see visual charts of their water usage patterns across different time periods and crop types to quickly identify trends and outliers without analyzing raw numbers.

**Why this priority**: Visualization makes data insights more accessible and actionable. Enhances the user experience but depends on having historical data from P2.

**Independent Test**: Can be tested by viewing charts generated from saved estimation data. Delivers value through visual insights that complement the tabular historical view.

**Acceptance Scenarios**:

1. **Given** a farmer has multiple estimation records, **When** they view the dashboard, **Then** they see charts showing water usage trends over time
2. **Given** a farmer has estimations for different crop types, **When** they view the dashboard, **Then** they see comparative visualizations showing usage patterns by crop type
3. **Given** a farmer is viewing charts, **When** they hover over data points, **Then** they see detailed information for that specific estimation
4. **Given** a farmer has only one estimation record, **When** they view the dashboard, **Then** they see a message indicating more data is needed for meaningful trends

---

### Edge Cases

- What happens when electricity usage is zero or extremely low (pump not operating)?
- What happens when field area exceeds realistic values for individual farmers (detect data entry errors)?
- How does the system handle very old estimation records (data retention limits)?
- What happens when a farmer tries to calculate with crop types not in the system's database?
- How does the system handle calculations resulting in unusually high water usage values (potential errors)?
- When network connection is lost, application displays "No connection" message in Traditional Chinese and disables all functionality until connection is restored

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST accept crop type selection from a predefined list including: Rice, Leafy Greens, Root Vegetables, Citrus Trees, Mango Trees, and 1-3 additional common Taiwanese crops (5-8 total categories)
- **FR-002**: System MUST accept Taiwan Power Company (Taipower) electricity bill amount input measured in New Taiwan Dollars (TWD), then reverse-calculate actual electricity usage in kilowatt-hours (kWh) using Taipower's progressive pricing structure
- **FR-002a**: System MUST fetch current Taipower pricing data from official API (https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json) and cache for 24 hours (measured from fetch timestamp) to minimize API calls
- **FR-002b**: System MUST handle Taipower API failures gracefully: On initial fetch failure, use fallback static pricing data embedded in config; On cache expiry refetch failure, continue using expired cache data and display warning "目前使用離線電價資料，可能與最新費率不同"; Retry failed fetch after 5 minutes
- **FR-003**: System MUST accept field area input measured in hectares or square meters
- **FR-004**: System MUST calculate water flow rate (Q) based on electricity-to-water conversion formulas appropriate for agricultural pumps
- **FR-005**: System MUST calculate total monthly water volume (V) based on flow rate, operating hours, and field requirements
- **FR-006**: System MUST validate all input fields: electricity usage between 10-5,000 kWh, field area between 0.5-50 hectares, with clear error messages for out-of-range values
- **FR-007**: System MUST display calculation results showing water flow rate (Q) in liters per second (L/s) with 2 decimal places, total monthly volume (V) in cubic meters (m³) with 1 decimal place, and calculated electricity usage in kWh with 0 decimal places
- **FR-008**: System MUST save each completed estimation with timestamp, input parameters, and calculated results
- **FR-009**: System MUST persist saved estimations across application sessions (survive browser refresh/restart)
- **FR-010**: System MUST display historical estimations in a sortable table format
- **FR-011**: System MUST provide a dashboard view with data visualization charts
- **FR-012**: System MUST support visualization of usage trends over time (line/bar charts)
- **FR-013**: System MUST support visualization of usage comparisons by crop type
- **FR-014**: System MUST display clear error messages for invalid inputs in Traditional Chinese
- **FR-015**: System MUST handle calculation edge cases (zero values, extreme values) with appropriate warnings
- **FR-016**: Users MUST be able to access the application through a web browser
- **FR-017**: System MUST detect offline status and display "No connection" message in Traditional Chinese, disabling all functionality until connectivity is restored

### Taipower Progressive Pricing Structure _(mandatory)_

**Billing Seasons**:
- **夏月 (Summer Billing Season)**: June 1 - September 30
- **非夏月 (Non-Summer Billing Season)**: October 1 - May 31

**Progressive Pricing Tiers**:

*夏月 (Summer) Rates*:
- 0-120 kWh: $2.10 TWD/kWh
- 121-330 kWh: $3.02 TWD/kWh
- 331-500 kWh: $4.39 TWD/kWh
- 501-700 kWh: $5.44 TWD/kWh
- 701-1000 kWh: $6.16 TWD/kWh
- 1001+ kWh: $6.71 TWD/kWh

*非夏月 (Non-Summer) Rates*:
- 0-120 kWh: $2.10 TWD/kWh
- 121-330 kWh: $2.68 TWD/kWh
- 331-500 kWh: $3.61 TWD/kWh
- 501-700 kWh: $4.48 TWD/kWh
- 701-1000 kWh: $5.03 TWD/kWh
- 1001+ kWh: $5.28 TWD/kWh

**Note**: These rates are fallback values embedded in application config. System fetches current rates from Taipower API and updates automatically (per FR-002a).

### Calculation Formulas _(mandatory)_

**Water Flow Rate (Q) Formula**:

```
Q = (P × η) / (0.222 × H × 1.2)
```

Where:

- Q = Water flow rate (liters per second, L/s)
- P = Pump horsepower (HP)
- η = Pump efficiency (decimal, e.g., 0.75 for 75%)
- 0.222 = Gravity constant for water pumping
- H = Well depth (meters)
- 1.2 = Safety factor

**Monthly Water Volume (V) Formula**:

```
V = (Q × 60 × C) / (2 × P × A)
```

Where:

- V = Total monthly water volume (cubic meters, m³)
- Q = Water flow rate from above formula (L/s)
- 60 = Minutes per hour conversion
- C = Calculated electricity usage (kWh) from Taipower bill reverse calculation
- 2 = Hours per kWh divisor (average operating hours estimation)
- P = Pump horsepower (HP)
- A = Field area in Taiwan "fen" units (1 fen ≈ 0.0969 hectares)

**Unit Conversions**:

- 1 fen (分地) = 0.0969 hectares = 969 square meters
- Field area input accepts both fen and hectares; system converts to fen for V calculation
- Over-extraction threshold: V > 2000 m³ triggers warning message

**Seasonal Adjustment Factors** (applied to base water volume by crop type):

| Crop Type | Spring (春季) | Summer (夏季) | Autumn (秋季) | Winter (冬季) |
|-----------|--------------|--------------|--------------|--------------|
| 水稻 (Rice) | 0.9 | 1.5 | 1.0 | 0.7 |
| 葉菜類 (Leafy Greens) | 1.0 | 1.3 | 0.9 | 0.8 |
| 根莖類 (Root Vegetables) | 0.8 | 1.2 | 1.0 | 0.6 |
| 柑橘類 (Citrus Trees) | 0.9 | 1.4 | 1.1 | 0.7 |
| 芒果樹 (Mango Trees) | 1.0 | 1.5 | 0.9 | 0.6 |

**Note**: These factors adjust base water volume calculations for seasonal irrigation requirements. Summer represents peak irrigation season; winter requires minimal irrigation.

### Key Entities

- **Estimation Record**: Represents a single water usage calculation session containing timestamp, crop type, electricity usage (kWh), field area (hectares/m²), calculated water flow rate (Q in L/s), calculated monthly volume (V in m³), and optional farmer notes
- **Crop Type**: Represents 5-8 agricultural crop categories (Rice, Leafy Greens, Root Vegetables, Citrus Trees, Mango Trees, plus 1-3 others) with associated water requirement coefficients and typical irrigation patterns used in calculation formulas
- **Calculation Parameters**: Represents the conversion factors and formulas linking electricity consumption to water flow rates, accounting for pump efficiency and regional characteristics

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Farmers can complete a water usage estimation in under 2 minutes from opening the application to viewing results
- **SC-002**: Calculation results are displayed immediately (within 1 second) after data entry
- **SC-003**: 90% of farmers successfully complete their first estimation without assistance
- **SC-004**: Historical estimation data persists reliably across 100% of application restarts
- **SC-005**: Dashboard charts load and display within 3 seconds when viewing up to 100 saved estimations
- **SC-006**: Input validation prevents 100% of invalid data entries from producing incorrect calculations
- **SC-007**: Farmers can view and sort historical records containing at least 50 estimations without performance degradation
- **SC-008**: Visual charts accurately represent estimation data with zero calculation errors

## Assumptions

### Domain Assumptions

- Electricity-to-water conversion formulas are based on standard agricultural pump efficiency rates common in Taiwan
- Crop types include common Taiwanese agricultural products (rice, vegetables, fruit trees, etc.)
- Target users are medium-sized farms with field areas ranging from 0.5 to 50 hectares
- Monthly water volume calculations assume standard 30-day periods
- Electricity usage represents pumping operations (10-5,000 kWh range), not total farm electricity consumption

### User Assumptions

- Farmers have access to their electricity meter readings
- Users are familiar with their field sizes in metric units
- Farmers can identify their primary crop types
- Users have basic digital literacy to operate form-based applications

### Technical Assumptions

- Application uses local browser storage (single device persistence only, no cross-device sync)
- Application requires active internet connection for all functionality (no offline mode)
- Calculations are performed client-side (no server-side computation required)
- Data retention period defaults to unlimited (farmers may have years of historical data)
- Charts support basic interactions (hover tooltips, zooming optional)
- Application targets modern devices with standard screen sizes (not optimized for feature phones)
- Each browser/device maintains its own independent estimation history
