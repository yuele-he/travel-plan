(() => {
  "use strict";

  const ENV_ID = "travel-planner-d9gm7wp2b5b69c288";
  const REGION = "ap-shanghai";
  const FUNCTION_NAME = "travel-planner";

  let app;
  let authReady;

  function getApp() {
    if (!window.cloudbase) {
      throw new Error("cloudbase_sdk_unavailable");
    }
    if (!app) {
      app = window.cloudbase.init({
        env: ENV_ID,
        region: REGION
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
        } catch {
          // Fall through to a fresh anonymous sign-in.
        }
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

  function normalizeResult(response) {
    let result = response?.result ?? response;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result);
      } catch {
        // Keep the raw string so the caller can reject it below.
      }
    }
    return result;
  }

  async function call(action, data) {
    await ensureAnonymousSession();
    const response = await getApp().callFunction({
      name: FUNCTION_NAME,
      data: { action, ...data },
      parse: true
    });

    const result = normalizeResult(response);
    if (!result || result.ok !== true) {
      const error = new Error(result?.message || result?.code || "cloudbase_function_failed");
      error.code = result?.code || "CLOUDBASE_FUNCTION_FAILED";
      throw error;
    }
    return result;
  }

  window.TravelCloudBase = Object.freeze({
    envId: ENV_ID,
    functionName: FUNCTION_NAME,
    createOrder(payload) {
      return call("createOrder", payload);
    },
    getFinalGuide(accessToken) {
      return call("getFinalGuide", { access_token: accessToken });
    }
  });
})();
