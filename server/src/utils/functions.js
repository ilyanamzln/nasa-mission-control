function isPreviousDate(date) {
  const today = new Date();
  // Set today's time to midnight for accurate comparison
  today.setHours(0, 0, 0, 0);

  // Ensure the input is also a Date object
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate < today;
}

module.exports = {
  isPreviousDate,
};
