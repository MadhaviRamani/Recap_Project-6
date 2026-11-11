export const PROFILE_NAME_KEY = "profile-name";
export const DARK_MODE_KEY = "dark-mode";

// the profile name survives a reload; without a stored name the default is used
export function loadProfileName(defaultName: string): string {
  const storedName = localStorage.getItem(PROFILE_NAME_KEY);

  // an empty or whitespace-only name is never shown
  if (storedName === null || !storedName.trim()) {
    return defaultName;
  }

  return storedName;
}

export function saveProfileName(profileName: string) {
  localStorage.setItem(PROFILE_NAME_KEY, profileName);
}

// the app starts dark unless dark mode was turned off before
export function loadIsDarkMode(): boolean {
  return localStorage.getItem(DARK_MODE_KEY) !== "false";
}

export function saveIsDarkMode(isDarkMode: boolean) {
  localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
}
