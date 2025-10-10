/**
 * Chart Data Transformation Utilities
 * Transforms history records into ECharts-compatible data structures
 */

/**
 * Get season from timestamp
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Season name
 */
export function getSeason(timestamp) {
  const month = new Date(timestamp).getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/**
 * Get season name in Traditional Chinese
 * @param {string} season - Season key
 * @returns {string} Season name in Chinese
 */
export function getSeasonName(season) {
  const names = {
    spring: "春季",
    summer: "夏季",
    autumn: "秋季",
    winter: "冬季",
  };
  return names[season] || season;
}

/**
 * Transform records for seasonal chart
 * Groups records by season and calculates average water volume
 * @param {Array} records - History records
 * @returns {Object} Chart data with categories and series
 */
export function transformForSeasonalChart(records) {
  const seasonalData = {
    spring: { total: 0, count: 0 },
    summer: { total: 0, count: 0 },
    autumn: { total: 0, count: 0 },
    winter: { total: 0, count: 0 },
  };

  records.forEach((record) => {
    const season = getSeason(record.timestamp);
    if (record.monthlyVolume) {
      seasonalData[season].total += record.monthlyVolume;
      seasonalData[season].count += 1;
    }
  });

  const categories = ["春季", "夏季", "秋季", "冬季"];
  const data = [
    seasonalData.spring.count > 0
      ? seasonalData.spring.total / seasonalData.spring.count
      : 0,
    seasonalData.summer.count > 0
      ? seasonalData.summer.total / seasonalData.summer.count
      : 0,
    seasonalData.autumn.count > 0
      ? seasonalData.autumn.total / seasonalData.autumn.count
      : 0,
    seasonalData.winter.count > 0
      ? seasonalData.winter.total / seasonalData.winter.count
      : 0,
  ];

  return { categories, data };
}

/**
 * Transform records for crop comparison chart
 * Groups records by crop type and calculates average water volume
 * @param {Array} records - History records
 * @returns {Object} Chart data with categories and series
 */
export function transformForCropChart(records) {
  const cropData = {};

  records.forEach((record) => {
    if (!record.cropType || !record.monthlyVolume) return;

    if (!cropData[record.cropType]) {
      cropData[record.cropType] = { total: 0, count: 0 };
    }

    cropData[record.cropType].total += record.monthlyVolume;
    cropData[record.cropType].count += 1;
  });

  const categories = Object.keys(cropData);
  const data = categories.map((crop) => {
    const avg = cropData[crop].total / cropData[crop].count;
    return {
      value: avg,
      itemStyle: {
        color: avg > 2000 ? "#f59e0b" : "#3b82f6",
      },
    };
  });

  return { categories, data };
}

/**
 * Transform records for annual trend chart
 * Groups records by month and shows volume over time
 * @param {Array} records - History records
 * @returns {Object} Chart data with dates and series
 */
export function transformForAnnualChart(records) {
  // Sort by timestamp
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);

  const dates = [];
  const volumes = [];
  const kwhs = [];

  sorted.forEach((record) => {
    const date = new Date(record.timestamp);
    const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    dates.push(dateStr);
    volumes.push(record.monthlyVolume || 0);
    kwhs.push(record.calculatedKwh || 0);
  });

  return { dates, volumes, kwhs };
}

/**
 * Calculate statistics from records
 * @param {Array} records - History records
 * @returns {Object} Statistics
 */
export function calculateStats(records) {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      avgVolume: 0,
      maxVolume: 0,
      minVolume: 0,
      avgKwh: 0,
      overExtractionCount: 0,
    };
  }

  const volumes = records.map((r) => r.monthlyVolume || 0);
  const kwhs = records.map((r) => r.calculatedKwh || 0);

  const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
  const totalKwh = kwhs.reduce((sum, k) => sum + k, 0);

  return {
    totalRecords: records.length,
    avgVolume: totalVolume / records.length,
    maxVolume: Math.max(...volumes),
    minVolume: Math.min(...volumes),
    avgKwh: totalKwh / records.length,
    overExtractionCount: records.filter((r) => r.monthlyVolume > 2000).length,
  };
}

/**
 * Group records by time period
 * @param {Array} records - History records
 * @param {string} period - 'day' | 'week' | 'month' | 'year'
 * @returns {Object} Grouped records
 */
export function groupByPeriod(records, period = "month") {
  const grouped = {};

  records.forEach((record) => {
    const date = new Date(record.timestamp);
    let key;

    switch (period) {
      case "day":
        key = date.toLocaleDateString("zh-TW");
        break;
      case "week":
        // Get week number
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-${date.getMonth() + 1}-W${weekNum}`;
        break;
      case "month":
        key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        break;
      case "year":
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toLocaleDateString("zh-TW");
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(record);
  });

  return grouped;
}
