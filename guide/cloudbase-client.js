(() => {
  "use strict";

  const CONFIG = window.TRAVEL_GUIDE_CONFIG || {};
  let app;
  let authReady;

  function getApp() {
    if (!window.cloudbase) throw new Error("cloudbase_sdk_unavailable");
    if (!CONFIG.cloudbaseEnvId) throw new Error("cloudbase_env_not_configured");
    if (!app) {
      app = window.cloudbase.init({
        env: CONFIG.cloudbaseEnvId,
        region: CONFIG.cloudbaseRegion || "ap-shanghai"
      });
    }
    return app;
  }

  function getAuth(instance) {
    return typeof instance.auth === "function" ? instance.auth() : instance.auth;
  }

  async function ensureAnonymousSession() {
    if (authReady) return authReady;

    authReady = (async () => {
      const instance = getApp();
      const auth = getAuth(instance);
      if (!auth || typeof auth.signInAnonymously !== "function") {
        throw new Error("cloudbase_auth_unavailable");
      }

      if (typeof auth.getSession === "function") {
        try {
          const sessionResult = await auth.getSession();
          if (sessionResult?.data?.session || sessionResult?.session) return;
        } catch {}
      }

      const result = await auth.signInAnonymously();
      if (result?.error) {
        throw new Error(result.error.message || result.error.code || "anonymous_login_failed");
      }
    })();

    try {
      await authReady;
    } catch (error) {
      authReady = null;
      throw error;
    }
  }

  async function getFinalGuide(accessToken) {
    await ensureAnonymousSession();
    const response = await getApp().callFunction({
      name: CONFIG.cloudbaseFunctionName || "travel-planner",
      data: {
        action: "getFinalGuide",
        access_token: accessToken
      },
      parse: true
    });

    let result = response?.result ?? response;
    if (typeof result === "string") {
      try { result = JSON.parse(result); } catch {}
    }

    if (!result || result.ok !== true) {
      const error = new Error(result?.code || "guide_load_failed");
      error.code = result?.code || "GUIDE_LOAD_FAILED";
      throw error;
    }

    return result.view_model;
  }

  window.TravelGuideCloudBase = Object.freeze({ getFinalGuide });
})();
