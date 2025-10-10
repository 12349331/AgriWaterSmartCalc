import { describe, it, expect } from "vitest";
import {
  getSeason,
  getSeasonName,
  transformForSeasonalChart,
  transformForCropChart,
  transformForAnnualChart,
  calculateStats,
} from "@/utils/chartHelpers";

describe("Chart Helpers", () => {
  describe("getSeason", () => {
    it("should return correct season for each month", () => {
      expect(getSeason(new Date("2024-03-15").getTime())).toBe("spring");
      expect(getSeason(new Date("2024-06-15").getTime())).toBe("summer");
      expect(getSeason(new Date("2024-09-15").getTime())).toBe("autumn");
      expect(getSeason(new Date("2024-12-15").getTime())).toBe("winter");
    });

    it("should handle edge months", () => {
      expect(getSeason(new Date("2024-02-28").getTime())).toBe("winter");
      expect(getSeason(new Date("2024-05-31").getTime())).toBe("spring");
      expect(getSeason(new Date("2024-08-31").getTime())).toBe("summer");
      expect(getSeason(new Date("2024-11-30").getTime())).toBe("autumn");
    });
  });

  describe("getSeasonName", () => {
    it("should return Chinese season names", () => {
      expect(getSeasonName("spring")).toBe("春季");
      expect(getSeasonName("summer")).toBe("夏季");
      expect(getSeasonName("autumn")).toBe("秋季");
      expect(getSeasonName("winter")).toBe("冬季");
    });

    it("should return original value for unknown season", () => {
      expect(getSeasonName("unknown")).toBe("unknown");
    });
  });

  describe("transformForSeasonalChart", () => {
    it("should transform records into seasonal data", () => {
      const records = [
        { timestamp: new Date("2024-03-15").getTime(), monthlyVolume: 1500 },
        { timestamp: new Date("2024-04-15").getTime(), monthlyVolume: 1600 },
        { timestamp: new Date("2024-06-15").getTime(), monthlyVolume: 2000 },
      ];

      const result = transformForSeasonalChart(records);

      expect(result.categories).toEqual(["春季", "夏季", "秋季", "冬季"]);
      expect(result.data[0]).toBeCloseTo(1550, 0); // Spring average
      expect(result.data[1]).toBe(2000); // Summer
      expect(result.data[2]).toBe(0); // Autumn (no data)
      expect(result.data[3]).toBe(0); // Winter (no data)
    });

    it("should handle empty records", () => {
      const result = transformForSeasonalChart([]);
      expect(result.data).toEqual([0, 0, 0, 0]);
    });
  });

  describe("transformForCropChart", () => {
    it("should transform records by crop type", () => {
      const records = [
        { cropType: "水稻", monthlyVolume: 1500 },
        { cropType: "水稻", monthlyVolume: 1700 },
        { cropType: "葉菜類", monthlyVolume: 1000 },
      ];

      const result = transformForCropChart(records);

      expect(result.categories).toContain("水稻");
      expect(result.categories).toContain("葉菜類");
      expect(result.data[0].value).toBeCloseTo(1600, 0); // Rice average
    });

    it("should color over-extraction differently", () => {
      const records = [{ cropType: "水稻", monthlyVolume: 2500 }];
      const result = transformForCropChart(records);

      expect(result.data[0].itemStyle.color).toBe("#f59e0b");
    });
  });

  describe("transformForAnnualChart", () => {
    it("should transform records chronologically", () => {
      const records = [
        {
          timestamp: new Date("2024-01-15").getTime(),
          monthlyVolume: 1500,
          calculatedKwh: 500,
        },
        {
          timestamp: new Date("2024-02-15").getTime(),
          monthlyVolume: 1600,
          calculatedKwh: 600,
        },
      ];

      const result = transformForAnnualChart(records);

      expect(result.dates).toEqual(["2024/01", "2024/02"]);
      expect(result.volumes).toEqual([1500, 1600]);
      expect(result.kwhs).toEqual([500, 600]);
    });

    it("should sort records by date", () => {
      const records = [
        {
          timestamp: new Date("2024-02-15").getTime(),
          monthlyVolume: 1600,
          calculatedKwh: 600,
        },
        {
          timestamp: new Date("2024-01-15").getTime(),
          monthlyVolume: 1500,
          calculatedKwh: 500,
        },
      ];

      const result = transformForAnnualChart(records);

      expect(result.dates[0]).toBe("2024/01");
      expect(result.dates[1]).toBe("2024/02");
    });
  });

  describe("calculateStats", () => {
    it("should calculate statistics correctly", () => {
      const records = [
        { monthlyVolume: 1500, calculatedKwh: 500 },
        { monthlyVolume: 2500, calculatedKwh: 800 },
        { monthlyVolume: 1800, calculatedKwh: 600 },
      ];

      const stats = calculateStats(records);

      expect(stats.totalRecords).toBe(3);
      expect(stats.avgVolume).toBeCloseTo(1933.33, 2);
      expect(stats.maxVolume).toBe(2500);
      expect(stats.minVolume).toBe(1500);
      expect(stats.avgKwh).toBeCloseTo(633.33, 2);
      expect(stats.overExtractionCount).toBe(1);
    });

    it("should handle empty records", () => {
      const stats = calculateStats([]);

      expect(stats.totalRecords).toBe(0);
      expect(stats.avgVolume).toBe(0);
      expect(stats.maxVolume).toBe(0);
      expect(stats.minVolume).toBe(0);
    });
  });
});
