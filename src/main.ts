import { App } from "./App";

// Initialize the 3D Exhibition when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("app");
  if (!container) {
    console.error("Could not find app container element");
    return;
  }

  // Create and initialize the application
  const app = new App(container);

  // Handle page unload
  window.addEventListener("beforeunload", () => {
    app.dispose();
  });

  // Handle visibility change to pause/resume rendering
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Page is hidden, could pause rendering here
      console.log("Page hidden - pausing rendering");
    } else {
      // Page is visible, resume rendering
      console.log("Page visible - resuming rendering");
    }
  });
});
