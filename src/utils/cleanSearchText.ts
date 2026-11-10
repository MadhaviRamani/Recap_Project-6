// every run of spaces, tabs or non-breaking spaces becomes one space and
// the spaces around the text are removed, so "  van   gogh " is "van gogh"
export function cleanSearchText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
