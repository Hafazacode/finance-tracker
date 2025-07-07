// util/dataTransformer.js

export const transformBudgetsData = (data) => {
  const transformedData = {};
  if (!data || !Array.isArray(data)) return {};

  data.forEach(item => {
    // Asumsi item budget dari backend memiliki 'year' (int) dan 'month' (int)
    const monthFormatted = String(item.month).padStart(2, '0');
    const monthYearKey = `${item.year}-${monthFormatted}`;
    
    if (!transformedData[monthYearKey]) {
      transformedData[monthYearKey] = [];
    }
    transformedData[monthYearKey].push(item);
  });
  return transformedData;
};