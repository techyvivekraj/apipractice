
  // Helper function to convert snake_case to camelCase
  export default function convertToCamelCase(snake_case_str) {
    return snake_case_str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }