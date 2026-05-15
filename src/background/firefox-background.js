// Firefox temporary add-ons can run with background scripts when
// background.service_worker is disabled in the browser.
// Load the shared module-based background logic.
void import("./service-worker.js");
