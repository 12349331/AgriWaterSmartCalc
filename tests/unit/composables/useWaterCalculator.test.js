/**
 * Unit Tests for useWaterCalculator composable
 * Tests water flow rate (Q) and monthly volume (V) calculations
 */

import { describe, it, expect } from 'vitest';
import { useWaterCalculator } from '@/composables/useWaterCalculator';

describe('useWaterCalculator', () => {
  const { calculateFlowRate, calculateVolume } = useWaterCalculator();

  describe('calculateFlowRate (Q formula)', () => {
    // Q = (P × η) / (0.222 × H × 1.2)
    // Where: P = horsepower, η = efficiency, H = well depth

    describe('Valid inputs', () => {
      it('should calculate flow rate correctly for standard parameters', () => {
        // P = 5 HP, η = 0.75, H = 20m
        // Q = (5 × 0.75) / (0.222 × 20 × 1.2)
        // Q = 3.75 / 5.328 = 0.704 L/s
        const result = calculateFlowRate(5, 0.75, 20);
        expect(result).toBeCloseTo(0.704, 2);
      });

      it('should calculate flow rate for high horsepower pump', () => {
        // P = 10 HP, η = 0.80, H = 30m
        // Q = (10 × 0.80) / (0.222 × 30 × 1.2)
        // Q = 8.0 / 7.992 = 1.001 L/s
        const result = calculateFlowRate(10, 0.80, 30);
        expect(result).toBeCloseTo(1.001, 2);
      });

      it('should calculate flow rate for shallow well', () => {
        // P = 3 HP, η = 0.70, H = 10m
        // Q = (3 × 0.70) / (0.222 × 10 × 1.2)
        // Q = 2.1 / 2.664 = 0.788 L/s
        const result = calculateFlowRate(3, 0.70, 10);
        expect(result).toBeCloseTo(0.788, 2);
      });

      it('should calculate flow rate for deep well', () => {
        // P = 7 HP, η = 0.75, H = 80m (North Taiwan typical)
        // Q = (7 × 0.75) / (0.222 × 80 × 1.2)
        // Q = 5.25 / 21.312 = 0.246 L/s
        const result = calculateFlowRate(7, 0.75, 80);
        expect(result).toBeCloseTo(0.246, 2);
      });

      it('should handle maximum efficiency (100%)', () => {
        // P = 5 HP, η = 1.0, H = 20m
        // Q = (5 × 1.0) / (0.222 × 20 × 1.2)
        // Q = 5.0 / 5.328 = 0.939 L/s
        const result = calculateFlowRate(5, 1.0, 20);
        expect(result).toBeCloseTo(0.939, 2);
      });

      it('should handle minimum valid efficiency', () => {
        // P = 5 HP, η = 0.5, H = 20m
        // Q = (5 × 0.5) / (0.222 × 20 × 1.2)
        // Q = 2.5 / 5.328 = 0.469 L/s
        const result = calculateFlowRate(5, 0.5, 20);
        expect(result).toBeCloseTo(0.469, 2);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero horsepower', () => {
        const result = calculateFlowRate(0, 0.75, 20);
        expect(result).toBe(0);
      });

      it('should handle zero efficiency', () => {
        const result = calculateFlowRate(5, 0, 20);
        expect(result).toBe(0);
      });

      it('should handle zero well depth', () => {
        // Division by zero scenario - should handle gracefully
        const result = calculateFlowRate(5, 0.75, 0);
        expect(result).toBe(0); // Implementation returns 0 for invalid inputs
      });

      it('should handle very small horsepower', () => {
        const result = calculateFlowRate(0.5, 0.75, 20);
        expect(result).toBeCloseTo(0.0704, 3);
      });

      it('should handle very deep well', () => {
        // P = 5 HP, η = 0.75, H = 200m (extreme case)
        const result = calculateFlowRate(5, 0.75, 200);
        expect(result).toBeLessThan(0.1); // Very low flow rate
      });
    });

    describe('Boundary validation (per FR-006)', () => {
      it('should handle efficiency at boundary (0.5-1.0 typical range)', () => {
        const resultMin = calculateFlowRate(5, 0.5, 20);
        const resultMax = calculateFlowRate(5, 1.0, 20);

        expect(resultMin).toBeGreaterThan(0);
        expect(resultMax).toBeGreaterThan(resultMin);
      });

      it('should handle horsepower variation (1-15 HP typical)', () => {
        const result1HP = calculateFlowRate(1, 0.75, 20);
        const result15HP = calculateFlowRate(15, 0.75, 20);

        expect(result15HP).toBeCloseTo(result1HP * 15, 1);
      });
    });

    describe('Formula constant validation', () => {
      it('should use correct gravity constant (0.222)', () => {
        // This is implicitly tested by checking expected values
        // If constant is wrong, all calculations will be off
        const result = calculateFlowRate(5, 0.75, 20);
        expect(result).toBeCloseTo(0.704, 2); // Validated against manual calculation
      });

      it('should use correct safety factor (1.2)', () => {
        // Safety factor of 1.2 is embedded in denominator
        const result = calculateFlowRate(5, 0.75, 20);
        // If factor was 1.0 instead of 1.2, result would be 0.845
        // With 1.2: result is 0.704
        expect(result).toBeLessThan(0.750);
      });
    });
  });

  describe('calculateVolume (V formula)', () => {
    // V = (Q × 60 × C) / (2 × P × A_fen)
    // Where: Q = flow rate (L/s), C = kWh, P = horsepower, A = field area (fen)

    describe('Valid inputs', () => {
      it('should calculate monthly volume correctly for standard parameters', () => {
        // Q = 0.704 L/s, C = 300 kWh, P = 5 HP, A = 10 fen
        // V = (0.704 × 60 × 300) / (2 × 5 × 10)
        // V = 12672 / 100 = 126.72 m³
        const result = calculateVolume(0.704, 300, 5, 10);
        expect(result).toBeCloseTo(126.72, 1);
      });

      it('should calculate volume for small field', () => {
        // Q = 0.5 L/s, C = 150 kWh, P = 3 HP, A = 5 fen
        // V = (0.5 × 60 × 150) / (2 × 3 × 5)
        // V = 4500 / 30 = 150 m³
        const result = calculateVolume(0.5, 150, 3, 5);
        expect(result).toBeCloseTo(150, 1);
      });

      it('should calculate volume for large field', () => {
        // Q = 1.0 L/s, C = 800 kWh, P = 7 HP, A = 30 fen
        // V = (1.0 × 60 × 800) / (2 × 7 × 30)
        // V = 48000 / 420 = 114.29 m³
        const result = calculateVolume(1.0, 800, 7, 30);
        expect(result).toBeCloseTo(114.29, 1);
      });

      it('should detect over-extraction (>2000 m³)', () => {
        // High usage scenario
        // Q = 2.0 L/s, C = 5000 kWh, P = 5 HP, A = 10 fen
        // V = (2.0 × 60 × 5000) / (2 × 5 × 10)
        // V = 600000 / 100 = 6000 m³ (exceeds 2000 threshold)
        const result = calculateVolume(2.0, 5000, 5, 10);
        expect(result).toBeGreaterThan(2000);
        expect(result).toBeCloseTo(6000, 0);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero flow rate', () => {
        const result = calculateVolume(0, 300, 5, 10);
        expect(result).toBe(0);
      });

      it('should handle zero kWh', () => {
        const result = calculateVolume(0.704, 0, 5, 10);
        expect(result).toBe(0);
      });

      it('should handle zero field area', () => {
        // Division by zero scenario
        const result = calculateVolume(0.704, 300, 5, 0);
        expect(result).toBe(0); // Implementation returns 0 for invalid inputs
      });

      it('should handle minimum valid kWh (10 kWh per FR-006)', () => {
        const result = calculateVolume(0.704, 10, 5, 10);
        expect(result).toBeCloseTo(4.224, 2);
      });

      it('should handle maximum valid kWh (5000 kWh per FR-006)', () => {
        const result = calculateVolume(0.704, 5000, 5, 10);
        expect(result).toBeCloseTo(2112, 0);
      });

      it('should handle minimum field area (0.5 hectares = ~5.16 fen)', () => {
        const result = calculateVolume(0.704, 300, 5, 5.16);
        expect(result).toBeGreaterThan(0);
      });

      it('should handle maximum field area (50 hectares = ~516 fen)', () => {
        const result = calculateVolume(0.704, 300, 5, 516);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(10); // Very low per-fen usage
      });
    });

    describe('Unit conversion validation', () => {
      it('should correctly apply 60-minute conversion factor', () => {
        // This converts L/s to L/min in the formula
        const result = calculateVolume(1.0, 100, 5, 10);
        // If 60 was omitted, result would be 60x smaller
        expect(result).toBeGreaterThan(10);
      });

      it('should correctly apply 2-hour divisor', () => {
        // This represents average operating hours per kWh
        const result = calculateVolume(1.0, 100, 5, 10);
        // Result should be influenced by this factor
        expect(result).toBeCloseTo(60, 1); // 1.0 * 60 * 100 / (2 * 5 * 10) = 60
      });
    });

    describe('Realistic scenarios', () => {
      it('should calculate volume for typical rice field irrigation', () => {
        // Rice: 10 fen field, 5HP pump, 300 kWh/month
        const flowRate = calculateFlowRate(5, 0.75, 20);
        const volume = calculateVolume(flowRate, 300, 5, 10);

        expect(volume).toBeGreaterThan(50);
        expect(volume).toBeLessThan(200);
      });

      it('should calculate volume for vegetable field', () => {
        // Vegetables: 5 fen field, 3HP pump, 150 kWh/month
        const flowRate = calculateFlowRate(3, 0.70, 15);
        const volume = calculateVolume(flowRate, 150, 3, 5);

        expect(volume).toBeGreaterThan(100);
        expect(volume).toBeLessThan(300);
      });

      it('should calculate volume for fruit orchard', () => {
        // Fruit trees: 20 fen field, 7HP pump, 500 kWh/month
        const flowRate = calculateFlowRate(7, 0.75, 30);
        const volume = calculateVolume(flowRate, 500, 7, 20);

        expect(volume).toBeGreaterThan(50);
        expect(volume).toBeLessThan(150);
      });
    });

    describe('Formula accuracy', () => {
      it('should match manual calculation within acceptable precision', () => {
        // Manual calculation:
        // Q = 0.704 L/s, C = 300 kWh, P = 5 HP, A = 10 fen
        // V = (0.704 × 60 × 300) / (2 × 5 × 10)
        // V = 12672 / 100 = 126.72 m³
        const result = calculateVolume(0.704, 300, 5, 10);
        expect(Math.abs(result - 126.72)).toBeLessThan(0.1);
      });

      it('should be proportional to flow rate', () => {
        const volume1 = calculateVolume(0.5, 300, 5, 10);
        const volume2 = calculateVolume(1.0, 300, 5, 10);

        // Doubling flow rate should double volume
        expect(volume2).toBeCloseTo(volume1 * 2, 1);
      });

      it('should be proportional to kWh', () => {
        const volume1 = calculateVolume(0.704, 100, 5, 10);
        const volume2 = calculateVolume(0.704, 300, 5, 10);

        // Tripling kWh should triple volume
        expect(volume2).toBeCloseTo(volume1 * 3, 1);
      });

      it('should be inversely proportional to field area', () => {
        const volume1 = calculateVolume(0.704, 300, 5, 10);
        const volume2 = calculateVolume(0.704, 300, 5, 20);

        // Doubling field area should halve volume
        expect(volume2).toBeCloseTo(volume1 / 2, 1);
      });
    });
  });

  describe('Integration: Q and V together', () => {
    it('should produce consistent results when used sequentially', () => {
      // Simulate complete calculation workflow
      const horsepower = 5;
      const efficiency = 0.75;
      const wellDepth = 20;
      const kwh = 300;
      const fieldArea = 10;

      const flowRate = calculateFlowRate(horsepower, efficiency, wellDepth);
      const volume = calculateVolume(flowRate, kwh, horsepower, fieldArea);

      expect(flowRate).toBeGreaterThan(0);
      expect(volume).toBeGreaterThan(0);
      expect(volume).toBeLessThan(2000); // Not over-extraction
    });

    it('should detect over-extraction scenario correctly', () => {
      // High usage scenario
      const flowRate = calculateFlowRate(10, 0.80, 20);
      const volume = calculateVolume(flowRate, 5000, 10, 10);

      expect(volume).toBeGreaterThan(2000); // Over-extraction threshold
    });

    it('should handle minimum viable farm scenario', () => {
      // Small farm: 0.5 hectares (~5 fen), 3HP pump, 50 kWh
      const flowRate = calculateFlowRate(3, 0.70, 15);
      const volume = calculateVolume(flowRate, 50, 3, 5);

      expect(flowRate).toBeGreaterThan(0);
      expect(volume).toBeGreaterThan(0);
      expect(volume).toBeLessThan(100);
    });
  });
});
