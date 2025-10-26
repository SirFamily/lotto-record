export function calculateDateEnd() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed
  let day = now.getDate();

  let dateEnd = new Date(year, month, 16, 23, 50, 0, 0);

  if (day >= 16) {
    // If today is 16th or after, set dateEnd to 1st of next month
    month += 1;
    if (month > 11) { // December is 11, so next month is January of next year
      month = 0;
      year += 1;
    }
    dateEnd = new Date(year, month, 1, 23, 50, 0, 0);
  }

  return dateEnd;
}
