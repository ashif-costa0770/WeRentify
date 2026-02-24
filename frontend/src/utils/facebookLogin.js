const FB_APP_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2694434750924820";
const FB_API_VERSION = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || "v22.0";

const ensureFacebookInitialized = () => {
  if (!window.FB || window.fbSdkReady) return;

  if (window.__fbInitAttempted) return;
  window.__fbInitAttempted = true;

  window.FB.init({
    appId: FB_APP_ID,
    cookie: true,
    xfbml: false,
    version: FB_API_VERSION,
  });
  window.fbSdkReady = true;
};

const waitForFacebookReady = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Facebook login is only available in the browser"));
      return;
    }

    const start = Date.now();
    const timer = window.setInterval(() => {
      if (window.FB && !window.fbSdkReady) {
        try {
          ensureFacebookInitialized();
        } catch (_e) {
          // Keep polling until timeout; init might race with sdk bootstrap.
        }
      }

      if (window.FB && window.fbSdkReady) {
        clearInterval(timer);
        resolve();
        return;
      }

      if (Date.now() - start > 8000) {
        clearInterval(timer);
        reject(new Error("Facebook SDK not ready"));
      }
    }, 100);
  });

const getFacebookLoginStatus = () =>
  new Promise((resolve) => {
    window.FB.getLoginStatus((response) => resolve(response));
  });

const facebookLogout = () =>
  new Promise((resolve) => {
    window.FB.logout(() => resolve());
  });

export const loginWithFacebook = async ({ forceDialog = false } = {}) => {
  if (typeof window === "undefined") {
    throw new Error("Facebook login is only available in the browser");
  }

  if (window.location.protocol !== "https:") {
    throw new Error(
      "Facebook login requires HTTPS. Run the frontend with --experimental-https to use Facebook login.",
    );
  }

  await waitForFacebookReady();
  const currentStatus = await getFacebookLoginStatus();

  if (!forceDialog) {

    if (
      currentStatus?.status === "connected" &&
      currentStatus?.authResponse?.accessToken
    ) {
      return currentStatus.authResponse.accessToken;
    }
  }

  if (forceDialog && currentStatus?.status === "connected") {
    // Clear active FB SDK session before reopening modal to avoid token override warnings.
    await facebookLogout();
  }

  return new Promise((resolve, reject) => {
    window.FB.login(
      (response) => {
        if (
          response?.status === "connected" &&
          response?.authResponse?.accessToken
        ) {
          resolve(response.authResponse.accessToken);
          return;
        }
        reject(new Error("FACEBOOK_LOGIN_CANCELLED"));
      },
      { scope: "email,public_profile", return_scopes: true },
    );
  });
};
