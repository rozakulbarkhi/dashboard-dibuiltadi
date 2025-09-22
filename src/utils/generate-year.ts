export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years: string[] = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year.toString());
  }

  return years;
};
