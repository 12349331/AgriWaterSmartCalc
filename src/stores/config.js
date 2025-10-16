import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CROP_TYPES } from '@/config/crops'
import { REGIONAL_PRESETS } from '@/config/regions'
import { CALCULATION_PARAMS } from '@/config/constants'

export const useConfigStore = defineStore('config', () => {
  // State
  const cropTypes = ref(CROP_TYPES)
  const regionalPresets = ref(REGIONAL_PRESETS)
  const constants = ref(CALCULATION_PARAMS)

  // Getters
  const getCropById = computed(() => (id) => {
    return cropTypes.value.find((c) => c.id === id)
  })

  const getCropByName = computed(() => (name) => {
    return cropTypes.value.find((c) => c.name === name)
  })

  const getRegionById = computed(() => (id) => {
    return regionalPresets.value.find((r) => r.id === id)
  })

  const getSeasonalFactor = computed(() => (cropType, season) => {
    const crop = getCropByName.value(cropType)
    return crop?.seasonalFactors[season] || 1.0
  })

  return {
    // State
    cropTypes,
    regionalPresets,
    constants,
    // Getters
    getCropById,
    getCropByName,
    getRegionById,
    getSeasonalFactor,
  }
})
