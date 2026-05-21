export function blockNonNumericKeys(event) {
  if (["e", "E", "+", "-", "."].includes(event.key)) {
    event.preventDefault();
  }
}
