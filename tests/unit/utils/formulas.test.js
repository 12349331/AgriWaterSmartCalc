import { describe, it, expect } from "vitest";
import {
  calculateWaterFlowRate,
  calculateMonthlyVolume,
  hectaresToFen,
  fenToHectares,
  isOverExtraction,
} from "@/utils/formulas";

describe("Water Calculation Formulas", () => {
  describe("calculateWaterFlowRate", () => {
    it("should calculate water flow rate correctly", () => {
      const result = calculateWaterFlowRate(5.0, 0.75, 20.0);
      expect(result).toBeCloseTo(0.704, 3);
    });

    it("should return 0 for missing parameters", () => {
      expect(calculateWaterFlowRate(0, 0.75, 20.0)).toBe(0);
      expect(calculateWaterFlowRate(5.0, 0, 20.0)).toBe(0);
      expect(calculateWaterFlowRate(5.0, 0.75, 0)).toBe(0);
    });

    it("should handle edge cases", () => {
      const result = calculateWaterFlowRate(10.0, 1.0, 50.0);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("calculateMonthlyVolume", () => {
    it("should calculate monthly volume correctly", () => {
      const result = calculateMonthlyVolume(0.704, 500, 5.0, 2.0);
      expect(result).toBeCloseTo(1056, 0);
    });

    it("should return 0 for missing parameters", () => {
      expect(calculateMonthlyVolume(0, 500, 5.0, 2.0)).toBe(0);
      expect(calculateMonthlyVolume(0.704, 0, 5.0, 2.0)).toBe(0);
      expect(calculateMonthlyVolume(0.704, 500, 0, 2.0)).toBe(0);
      expect(calculateMonthlyVolume(0.704, 500, 5.0, 0)).toBe(0);
    });

    it("should scale with electricity usage", () => {
      const base = calculateMonthlyVolume(0.704, 500, 5.0, 2.0);
      const doubled = calculateMonthlyVolume(0.704, 1000, 5.0, 2.0);
      expect(doubled).toBeCloseTo(base * 2, 0);
    });
  });

  describe("hectaresToFen", () => {
    it("should convert hectares to fen correctly", () => {
      expect(hectaresToFen(0.0969)).toBeCloseTo(1, 2);
      expect(hectaresToFen(0.1938)).toBeCloseTo(2, 2);
    });

    it("should handle zero", () => {
      expect(hectaresToFen(0)).toBe(0);
    });
  });

  describe("fenToHectares", () => {
    it("should convert fen to hectares correctly", () => {
      expect(fenToHectares(1)).toBeCloseTo(0.0969, 4);
      expect(fenToHectares(2)).toBeCloseTo(0.1938, 4);
    });

    it("should handle zero", () => {
      expect(fenToHectares(0)).toBe(0);
    });
  });

  describe("isOverExtraction", () => {
    it("should detect over-extraction", () => {
      expect(isOverExtraction(2001)).toBe(true);
      expect(isOverExtraction(3000)).toBe(true);
    });

    it("should return false for normal usage", () => {
      expect(isOverExtraction(1999)).toBe(false);
      expect(isOverExtraction(1000)).toBe(false);
      expect(isOverExtraction(0)).toBe(false);
    });

    it("should handle threshold exactly", () => {
      expect(isOverExtraction(2000)).toBe(false);
    });
  });
});
