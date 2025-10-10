import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  // State
  const isLoading = ref(false);
  const error = ref(null);
  const successMessage = ref(null);
  const isOffline = ref(false);
  const activeTab = ref("seasonal");
  const showClearConfirm = ref(false);
  const showAdvancedParams = ref(false);

  // Actions
  function setLoading(value) {
    isLoading.value = value;
  }

  function setError(message) {
    error.value = message;
    setTimeout(() => {
      error.value = null;
    }, 5000); // Auto-dismiss after 5s
  }

  function setSuccess(message) {
    successMessage.value = message;
    setTimeout(() => {
      successMessage.value = null;
    }, 3000); // Auto-dismiss after 3s
  }

  function checkOnlineStatus() {
    isOffline.value = !navigator.onLine;

    window.addEventListener("online", () => {
      isOffline.value = false;
    });

    window.addEventListener("offline", () => {
      isOffline.value = true;
    });
  }

  function setActiveTab(tab) {
    activeTab.value = tab;
  }

  function toggleAdvancedParams() {
    showAdvancedParams.value = !showAdvancedParams.value;
  }

  return {
    // State
    isLoading,
    error,
    successMessage,
    isOffline,
    activeTab,
    showClearConfirm,
    showAdvancedParams,
    // Actions
    setLoading,
    setError,
    setSuccess,
    checkOnlineStatus,
    setActiveTab,
    toggleAdvancedParams,
  };
});
