import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";

export const useHistoryStore = defineStore("history", () => {
  // State
  const records = ref([]);

  // Getters
  const recordCount = computed(() => records.value.length);

  const sortedRecords = computed(() => {
    return [...records.value].sort((a, b) => b.timestamp - a.timestamp);
  });

  const getRecordById = computed(() => (id) => {
    return records.value.find((r) => r.id === id);
  });

  const getRecordsByDateRange = computed(() => (startDate, endDate) => {
    return records.value.filter((r) => {
      const date = new Date(r.timestamp);
      return date >= startDate && date <= endDate;
    });
  });

  const getRecordsByCrop = computed(() => (cropType) => {
    return records.value.filter((r) => r.cropType === cropType);
  });

  // Actions
  function addRecord(recordData) {
    const newRecord = {
      id: uuidv4(),
      timestamp: Date.now(),
      ...recordData,
    };

    records.value.push(newRecord);
    saveToLocalStorage();

    return newRecord;
  }

  function updateRecord(id, updates) {
    const index = records.value.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error("Record not found");
    }

    records.value[index] = {
      ...records.value[index],
      ...updates,
      updatedAt: Date.now(),
    };

    saveToLocalStorage();
    return records.value[index];
  }

  function deleteRecord(id) {
    const index = records.value.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error("Record not found");
    }

    records.value.splice(index, 1);
    saveToLocalStorage();
  }

  function clearAllRecords() {
    records.value = [];
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(
        "aquametrics_history",
        JSON.stringify(records.value)
      );
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      throw new Error("儲存失敗，可能空間不足");
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem("aquametrics_history");
      if (saved) {
        records.value = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }

  function exportToCSV() {
    if (records.value.length === 0) {
      throw new Error("無歷史記錄可匯出");
    }

    const headers = [
      "日期",
      "作物類型",
      "耕作面積(分地)",
      "電費(TWD)",
      "用電度數(kWh)",
      "水流量(L/s)",
      "月用水量(m³)",
      "地區",
    ];

    const rows = records.value.map((r) => [
      new Date(r.timestamp).toLocaleDateString("zh-TW"),
      r.cropType,
      r.fieldArea,
      r.billAmount,
      r.calculatedKwh?.toFixed(1) || "-",
      r.waterFlowRate?.toFixed(2) || "-",
      r.monthlyVolume?.toFixed(2) || "-",
      r.region,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    return csvContent;
  }

  function exportToJSON() {
    if (records.value.length === 0) {
      throw new Error("無歷史記錄可匯出");
    }

    return JSON.stringify(records.value, null, 2);
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function downloadCSV() {
    const csv = exportToCSV();
    const filename = `水資源紀錄_${new Date().toLocaleDateString("zh-TW")}.csv`;
    downloadFile(csv, filename, "text/csv;charset=utf-8;");
  }

  function downloadJSON() {
    const json = exportToJSON();
    const filename = `水資源紀錄_${new Date().toLocaleDateString("zh-TW")}.json`;
    downloadFile(json, filename, "application/json");
  }

  // Initialize
  function initialize() {
    loadFromLocalStorage();
  }

  // Auto-initialize
  initialize();

  return {
    // State
    records,
    // Getters
    recordCount,
    sortedRecords,
    getRecordById,
    getRecordsByDateRange,
    getRecordsByCrop,
    // Actions
    addRecord,
    updateRecord,
    deleteRecord,
    clearAllRecords,
    exportToCSV,
    exportToJSON,
    downloadCSV,
    downloadJSON,
  };
});
