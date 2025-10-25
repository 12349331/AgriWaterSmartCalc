/**
 * 台電 API 原始格式的欄位映射配置
 * 當 API 格式變動時，只需修改此檔案，不需改動程式邏輯
 *
 * 資料來源：台電公開資料 https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json
 * 最後更新：2025-10-25
 */

/**
 * 電價類型的 Column 欄位映射
 * 定義不同用電種類在原始 API 資料中對應的欄位名稱
 */
export const API_COLUMN_MAPPING = {
  表燈非營業用: {
    夏月: {
      column: 'Column8',
      rowStart: 4, // biaoData 陣列的起始索引
    },
    非夏月: {
      column: 'Column9',
      rowStart: 4,
    },
  },
  表燈營業用: {
    夏月: {
      column: 'Column13',
      rowStart: 4,
    },
    非夏月: {
      column: 'Column14',
      rowStart: 4,
    },
  },
  住宅用: {
    夏月: {
      column: 'Column3',
      rowStart: 4,
    },
    非夏月: {
      column: 'Column4',
      rowStart: 4,
    },
  },
}

/**
 * 級距定義
 * 定義每種電價類型的級距結構
 */
export const TIER_DEFINITIONS = {
  表燈非營業用: [
    {
      tier: '120度以下',
      maxKwh: 120,
      rowOffset: 0, // 相對於 rowStart 的偏移量
    },
    {
      tier: '121-330度',
      maxKwh: 330,
      rowOffset: 1,
    },
    {
      tier: '331-500度',
      maxKwh: 500,
      rowOffset: 2,
    },
    {
      tier: '501-700度',
      maxKwh: 700,
      rowOffset: 3,
    },
    {
      tier: '701-1000度',
      maxKwh: 1000,
      rowOffset: 4,
    },
    {
      tier: '1001度以上',
      maxKwh: null, // null 表示開放級距
      rowOffset: 5,
    },
  ],
  表燈營業用: [
    {
      tier: '330度以下',
      maxKwh: 330,
      rowOffset: 0,
    },
    {
      tier: '331-700度',
      maxKwh: 700,
      rowOffset: 1,
    },
    {
      tier: '701-1500度',
      maxKwh: 1500,
      rowOffset: 2,
    },
    {
      tier: '1501-3000度',
      maxKwh: 3000,
      rowOffset: 3,
    },
    {
      tier: '3001度以上',
      maxKwh: null,
      rowOffset: 4,
    },
  ],
  住宅用: [
    {
      tier: '120度以下',
      maxKwh: 120,
      rowOffset: 0,
    },
    {
      tier: '121-330度',
      maxKwh: 330,
      rowOffset: 1,
    },
    {
      tier: '331-500度',
      maxKwh: 500,
      rowOffset: 2,
    },
    {
      tier: '501-700度',
      maxKwh: 700,
      rowOffset: 3,
    },
    {
      tier: '701-1000度',
      maxKwh: 1000,
      rowOffset: 4,
    },
    {
      tier: '1001度以上',
      maxKwh: null,
      rowOffset: 5,
    },
  ],
}

/**
 * 季節定義
 */
export const SEASON_DEFINITIONS = {
  夏月: {
    period: '6月1日至9月30日',
    description: '夏季電價較高',
  },
  非夏月: {
    period: '夏月以外時間',
    description: '非夏季電價',
  },
}

/**
 * 電價類型說明
 */
export const ELECTRICITY_TYPE_DESCRIPTIONS = {
  表燈非營業用: '適用於農業灌溉等非營業用途',
  表燈營業用: '適用於營業場所',
  住宅用: '適用於住宅',
}
