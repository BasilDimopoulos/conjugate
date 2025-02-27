export const convertCTAString = (input) => {
  return input
    .toLowerCase() // Convert to lowercase
    .split('_') // Split by underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join back with spaces
};
