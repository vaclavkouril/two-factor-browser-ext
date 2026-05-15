export function hostnameMatches(hostname, allowedDomains) {
  return allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export function firstMatchingElement(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

export function detectOtpInput(selectors) {
  const configured = firstMatchingElement(selectors);
  if (configured) return configured;

  const heuristicSelectors = [
    "input[autocomplete='one-time-code']",
    "input[inputmode='numeric']",
    "input[name*='otp' i]",
    "input[name*='token' i]",
    "input[name*='code' i]",
    "input[id*='otp' i]",
    "input[id*='token' i]",
    "input[id*='code' i]",
    "input[aria-label*='verification' i]",
    "input[placeholder*='verification' i]",
    "input[placeholder*='2fa' i]",
    "input[placeholder*='one-time' i]"
  ];

  return firstMatchingElement(heuristicSelectors);
}

export function detectOtpInputs(selectors) {
  const configuredFound = (selectors || [])
    .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
    .filter(Boolean);

  if (configuredFound.length > 0) return configuredFound;

  const heuristicSelectors = [
    "input[autocomplete='one-time-code']",
    "input[inputmode='numeric']",
    "input[name*='otp' i]",
    "input[name*='token' i]",
    "input[name*='code' i]",
    "input[id*='otp' i]",
    "input[id*='token' i]",
    "input[id*='code' i]",
    "input[aria-label*='verification' i]",
    "input[placeholder*='verification' i]",
    "input[placeholder*='2fa' i]",
    "input[placeholder*='one-time' i]"
  ];

  const all = heuristicSelectors
    .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
    .filter((el, idx, arr) => arr.indexOf(el) === idx);

  return all;
}
