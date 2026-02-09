export const sizeOptions: Record<string, string[]> = {
  tops: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"],
  bottoms: ["26", "28", "30", "32", "34", "36", "38", "40", "42", "XS", "S", "M", "L", "XL", "XXL"],
  dresses: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
  shoes: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
  accessories: ["One Size", "Small", "Medium", "Large"],
  jewelry: ["One Size", "Adjustable"],
  outerwear: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  bags: ["Small", "Medium", "Large", "One Size"]
};

export const getCategorySizes = (category: string): string[] => {
  const normalizedCategory = category.toLowerCase();
  return sizeOptions[normalizedCategory] || ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
};
