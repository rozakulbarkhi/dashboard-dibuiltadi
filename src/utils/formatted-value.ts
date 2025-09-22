export const formattedValue = (size: number) => {
  const formatter = Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(size);
};
