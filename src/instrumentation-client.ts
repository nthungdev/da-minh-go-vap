if (typeof window !== "undefined") {
  const initAnalytics = () => {
    import("@/utils/firebase").then(({ getFirebaseAnalytics }) => {
      getFirebaseAnalytics().then((instance) => {
        if (instance) {
          console.info("Analytics initialized");
        }
      });
    });
  };

  if ("requestIdleCallback" in window) {
    (
      window as Window & { requestIdleCallback: (cb: () => void) => void }
    ).requestIdleCallback(initAnalytics);
  } else {
    setTimeout(initAnalytics, 2000);
  }
}
