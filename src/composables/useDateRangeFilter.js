import { ref, computed } from 'vue'

export function useDateRangeFilter(recordsRef, dateKey = 'billingPeriodStart') {
  const filterStartDate = ref(null)
  const filterEndDate = ref(null)

  const applyFilter = () => {
    // No explicit action needed here, as computed filteredRecords will react
    // However, if we wanted an explicit apply, this is where we'd trigger an update
    // For now, setting the refs is enough to trigger reactivity.
  }

  const clearFilter = () => {
    filterStartDate.value = null
    filterEndDate.value = null
  }

  const filteredRecords = computed(() => {
    if (!recordsRef.value) {
      return []
    }

    const start = filterStartDate.value ? new Date(filterStartDate.value) : null
    const end = filterEndDate.value ? new Date(filterEndDate.value) : null

    // Validate dates - if invalid, treat as no filter
    const isStartValid = start && !isNaN(start.getTime())
    const isEndValid = end && !isNaN(end.getTime())

    if (!isStartValid && !isEndValid) {
      return recordsRef.value // No valid filter applied
    }

    return recordsRef.value.filter(record => {
      // Exclude records without a valid date in the specified field
      if (!record[dateKey]) {
        return false
      }

      const recordDate = new Date(record[dateKey])

      // If recordDate is invalid, exclude it
      if (isNaN(recordDate.getTime())) {
        return false
      }

      let isAfterStart = true
      let isBeforeEnd = true

      if (isStartValid) {
        isAfterStart = recordDate >= start
      }
      if (isEndValid) {
        // To include the end date, we compare with the day after the end date
        // or simply ensure the recordDate is less than or equal to the end date
        // when comparing only dates without time.
        // If dates are YYYY-MM-DD, direct comparison is fine.
        const endOfDay = new Date(end)
        endOfDay.setHours(23, 59, 59, 999) // Include full end day
        isBeforeEnd = recordDate <= endOfDay
      }

      return isAfterStart && isBeforeEnd
    })
  })

  return {
    filterStartDate,
    filterEndDate,
    applyFilter,
    clearFilter,
    filteredRecords,
  }
}
