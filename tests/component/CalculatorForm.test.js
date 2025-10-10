import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import CalculatorForm from "@/components/calculator/CalculatorForm.vue";

describe("CalculatorForm", () => {
  const createWrapper = (props = {}) => {
    return mount(CalculatorForm, {
      props,
      global: {
        plugins: [createPinia()],
      },
    });
  };

  it("should render calculator form", () => {
    const wrapper = createWrapper();
    expect(wrapper.find("h2").text()).toBe("水資源估算");
  });

  it("should display all form fields", () => {
    const wrapper = createWrapper();

    expect(wrapper.find('input[type="number"][step="0.01"]').exists()).toBe(
      true
    );
    expect(wrapper.findAll("select").length).toBeGreaterThanOrEqual(1);
    expect(wrapper.findAll('input[type="radio"]').length).toBeGreaterThan(0);
  });

  it("should update form data when user inputs", async () => {
    const wrapper = createWrapper();

    // Fill in form fields
    const billInput = wrapper.find('input[type="number"][step="0.01"]');
    await billInput.setValue(3000);

    const fieldAreaInput = wrapper.find('input[type="number"][step="0.1"]');
    await fieldAreaInput.setValue(2);

    const cropSelect = wrapper.find("select");
    await cropSelect.setValue("水稻");

    // Check modelValue was updated
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
  });

  it("should show validation error for invalid bill amount", async () => {
    const wrapper = createWrapper();

    const input = wrapper.find('input[type="number"][step="0.01"]');

    // Set invalid value and wait for validation
    await input.setValue(-100);
    await wrapper.vm.$nextTick();

    // Check if error is shown (validation happens on watch)
    const html = wrapper.html();
    expect(html).toContain("電費金額必須大於 0 元");
  });

  it("should disable form when disabled prop is true", () => {
    const wrapper = createWrapper({ disabled: true });

    const inputs = wrapper.findAll("input");
    inputs.forEach((input) => {
      expect(input.attributes("disabled")).toBeDefined();
    });
  });

  it("should emit reset event", async () => {
    const wrapper = createWrapper();

    await wrapper.find('button[type="button"]').trigger("click");

    expect(wrapper.emitted("reset")).toBeTruthy();
  });

  it("should update v-model", async () => {
    const wrapper = createWrapper({
      modelValue: { billAmount: 1000 },
    });

    await wrapper.find('input[type="number"]').setValue(2000);

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted[emitted.length - 1][0].billAmount).toBe(2000);
  });
});
