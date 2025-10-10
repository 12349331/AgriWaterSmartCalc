<template>
  <div class="result-card">
    <h3 class="text-lg font-semibold mb-4">年度用水趨勢</h3>
    <div v-if="hasData" class="chart-container">
      <v-chart :option="chartOption" autoresize />
    </div>
    <div v-else class="text-center py-12 text-gray-500">
      <p>暫無資料</p>
      <p class="text-sm">累積多筆記錄後可查看時間趨勢</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { transformForAnnualChart } from "@/utils/chartHelpers";

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
]);

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
});

const hasData = computed(() => props.records.length > 0);

const chartData = computed(() => {
  if (!hasData.value) return { dates: [], volumes: [], kwhs: [] };
  return transformForAnnualChart(props.records);
});

const chartOption = computed(() => ({
  tooltip: {
    trigger: "axis",
    formatter: (params) => {
      const date = params[0].name;
      let result = `${date}<br/>`;

      params.forEach((param) => {
        const unit = param.seriesName.includes("用水量") ? " m³" : " kWh";
        result += `${param.marker} ${param.seriesName}: ${param.value.toFixed(
          2
        )}${unit}<br/>`;
      });

      return result;
    },
  },
  legend: {
    data: ["月用水量", "用電度數"],
    top: 10,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "15%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: chartData.value.dates,
    axisLabel: {
      fontSize: 11,
      rotate: chartData.value.dates.length > 8 ? 30 : 0,
    },
  },
  yAxis: [
    {
      type: "value",
      name: "用水量 (m³)",
      position: "left",
      axisLabel: {
        formatter: "{value}",
        fontSize: 11,
      },
    },
    {
      type: "value",
      name: "用電 (kWh)",
      position: "right",
      axisLabel: {
        formatter: "{value}",
        fontSize: 11,
      },
    },
  ],
  dataZoom: [
    {
      type: "slider",
      show: chartData.value.dates.length > 10,
      start: 0,
      end: 100,
      height: 20,
      bottom: 10,
    },
  ],
  series: [
    {
      name: "月用水量",
      type: "line",
      yAxisIndex: 0,
      data: chartData.value.volumes,
      smooth: true,
      lineStyle: {
        width: 3,
        color: "#3b82f6",
      },
      itemStyle: {
        color: "#3b82f6",
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(59, 130, 246, 0.2)" },
            { offset: 1, color: "rgba(59, 130, 246, 0.02)" },
          ],
        },
      },
    },
    {
      name: "用電度數",
      type: "line",
      yAxisIndex: 1,
      data: chartData.value.kwhs,
      smooth: true,
      lineStyle: {
        width: 2,
        color: "#10b981",
        type: "dashed",
      },
      itemStyle: {
        color: "#10b981",
      },
    },
  ],
}));
</script>

<style scoped>
.chart-container {
  height: 320px;
}

@media (min-width: 640px) {
  .chart-container {
    height: 380px;
  }
}

@media (min-width: 1024px) {
  .chart-container {
    height: 450px;
  }
}
</style>
