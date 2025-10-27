import { describe, it, expect } from 'vitest'
import {
  generateWaterRangeInsight,
  generateAvgWaterInsight,
  generateSummaryInsight,
  generateInsights,
} from '@/utils/insights-generator'

describe('insights-generator', () => {
  describe('generateWaterRangeInsight', () => {
    it('should return "變化範圍較大" when range > 50% of average', () => {
      // Range: 300 - 100 = 200, Average: 200, Percentage: 100% > 50%
      const result = generateWaterRangeInsight(200, 300, 100)
      expect(result).toBe('用水量變化範圍較大，建議檢視不同時期的灌溉策略。')
    })

    it('should return "變化範圍穩定" when range = 50% of average (boundary)', () => {
      // Range: 150 - 50 = 100, Average: 200, Percentage: 50%
      // Since 50 > 50 is false, it falls into the stable category
      const result = generateWaterRangeInsight(200, 150, 50)
      expect(result).toBe('用水量變化範圍穩定，灌溉策略一致性良好。')
    })

    it('should return "變化範圍穩定" when range < 50% of average', () => {
      // Range: 250 - 200 = 50, Average: 200, Percentage: 25% < 50%
      const result = generateWaterRangeInsight(200, 250, 200)
      expect(result).toBe('用水量變化範圍穩定，灌溉策略一致性良好。')
    })

    it('should handle avgWaterUsage = 0', () => {
      const result = generateWaterRangeInsight(0, 100, 50)
      expect(result).toBe('暫無足夠數據進行分析。')
    })

    it('should handle maxWaterUsage = 0', () => {
      const result = generateWaterRangeInsight(100, 0, 0)
      expect(result).toBe('暫無足夠數據進行分析。')
    })

    it('should handle all zero values', () => {
      const result = generateWaterRangeInsight(0, 0, 0)
      expect(result).toBe('暫無足夠數據進行分析。')
    })
  })

  describe('generateAvgWaterInsight', () => {
    it('should return "平均用水量較低" when avg < 100', () => {
      const result = generateAvgWaterInsight(50)
      expect(result).toBe('平均用水量較低，適合節水作物栽培。')
    })

    it('should return "平均用水量較低" when avg = 99.9', () => {
      const result = generateAvgWaterInsight(99.9)
      expect(result).toBe('平均用水量較低，適合節水作物栽培。')
    })

    it('should return "平均用水量適中" when avg = 100', () => {
      const result = generateAvgWaterInsight(100)
      expect(result).toBe('平均用水量適中，符合一般作物需求。')
    })

    it('should return "平均用水量適中" when 100 <= avg < 300', () => {
      const result = generateAvgWaterInsight(200)
      expect(result).toBe('平均用水量適中，符合一般作物需求。')
    })

    it('should return "平均用水量適中" when avg = 299.9', () => {
      const result = generateAvgWaterInsight(299.9)
      expect(result).toBe('平均用水量適中，符合一般作物需求。')
    })

    it('should return "平均用水量較高" when avg = 300', () => {
      const result = generateAvgWaterInsight(300)
      expect(result).toBe('平均用水量較高，建議定期檢視用水效率。')
    })

    it('should return "平均用水量較高" when avg > 300', () => {
      const result = generateAvgWaterInsight(500)
      expect(result).toBe('平均用水量較高，建議定期檢視用水效率。')
    })

    it('should handle avgWaterUsage = 0', () => {
      const result = generateAvgWaterInsight(0)
      expect(result).toBe('暫無用水記錄。')
    })
  })

  describe('generateSummaryInsight', () => {
    it('should always return fixed summary text', () => {
      const result = generateSummaryInsight()
      expect(result).toBe('建議定期追蹤用水記錄，以優化灌溉管理。')
    })
  })

  describe('generateInsights', () => {
    it('should generate complete insights array with valid data', () => {
      const stats = {
        avgWaterUsage: 200,
        maxWaterUsage: 400,
        minWaterUsage: 100,
      }
      const insights = generateInsights(stats)

      expect(insights).toHaveLength(3)
      expect(insights[0]).toBe('用水量變化範圍較大，建議檢視不同時期的灌溉策略。')
      expect(insights[1]).toBe('平均用水量適中，符合一般作物需求。')
      expect(insights[2]).toBe('建議定期追蹤用水記錄，以優化灌溉管理。')
    })

    it('should handle low water usage scenario', () => {
      const stats = {
        avgWaterUsage: 50,
        maxWaterUsage: 60,
        minWaterUsage: 40,
      }
      const insights = generateInsights(stats)

      expect(insights).toHaveLength(3)
      expect(insights[0]).toBe('用水量變化範圍穩定，灌溉策略一致性良好。')
      expect(insights[1]).toBe('平均用水量較低，適合節水作物栽培。')
      expect(insights[2]).toBe('建議定期追蹤用水記錄，以優化灌溉管理。')
    })

    it('should handle high water usage scenario', () => {
      const stats = {
        avgWaterUsage: 500,
        maxWaterUsage: 800,
        minWaterUsage: 200,
      }
      const insights = generateInsights(stats)

      expect(insights).toHaveLength(3)
      expect(insights[0]).toBe('用水量變化範圍較大，建議檢視不同時期的灌溉策略。')
      expect(insights[1]).toBe('平均用水量較高，建議定期檢視用水效率。')
      expect(insights[2]).toBe('建議定期追蹤用水記錄，以優化灌溉管理。')
    })

    it('should handle empty stats object', () => {
      const stats = {}
      const insights = generateInsights(stats)

      expect(insights).toHaveLength(3)
      expect(insights[0]).toBe('暫無足夠數據進行分析。')
      expect(insights[1]).toBe('暫無用水記錄。')
      expect(insights[2]).toBe('建議定期追蹤用水記錄，以優化灌溉管理。')
    })

    it('should handle zero values', () => {
      const stats = {
        avgWaterUsage: 0,
        maxWaterUsage: 0,
        minWaterUsage: 0,
      }
      const insights = generateInsights(stats)

      expect(insights).toHaveLength(3)
      expect(insights[0]).toBe('暫無足夠數據進行分析。')
      expect(insights[1]).toBe('暫無用水記錄。')
      expect(insights[2]).toBe('建議定期追蹤用水記錄，以優化灌溉管理。')
    })

    it('should handle partial stats data', () => {
      const stats = {
        avgWaterUsage: 150,
        // Missing maxWaterUsage and minWaterUsage
      }
      const insights = generateInsights(stats)

      expect(insights).toHaveLength(3)
      expect(insights[0]).toBe('暫無足夠數據進行分析。')
      expect(insights[1]).toBe('平均用水量適中，符合一般作物需求。')
      expect(insights[2]).toBe('建議定期追蹤用水記錄，以優化灌溉管理。')
    })
  })
})
