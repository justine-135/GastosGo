import { useThemeStore } from "../../stores/themeStore";

beforeEach(() => {
  useThemeStore.setState({ mode: "system" });
});

describe("useThemeStore", () => {
  it("defaults to system mode", () => {
    expect(useThemeStore.getState().mode).toBe("system");
  });

  it('setMode("light") updates mode to light', () => {
    useThemeStore.getState().setMode("light");
    expect(useThemeStore.getState().mode).toBe("light");
  });

  it('setMode("dark") updates mode to dark', () => {
    useThemeStore.getState().setMode("dark");
    expect(useThemeStore.getState().mode).toBe("dark");
  });

  it('setMode("system") reverts to system', () => {
    useThemeStore.getState().setMode("dark");
    useThemeStore.getState().setMode("system");
    expect(useThemeStore.getState().mode).toBe("system");
  });

  it("persists under the gastosgo-theme key", () => {
    // ensure the store name matches what AsyncStorage is keyed by
    expect(useThemeStore.persist.getOptions().name).toBe("gastosgo-theme");
  });
});
