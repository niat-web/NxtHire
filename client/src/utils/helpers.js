// client/src/utils/helpers.js
// Group items by a key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Calculate pagination data
export const calculatePagination = (currentPage, totalItems, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showingFrom = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(showingFrom + itemsPerPage - 1, totalItems);

  return {
    currentPage,
    totalPages,
    totalItems,
    showingFrom,
    showingTo,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages
  };
};

// Sort array of objects by a key
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] === null || a[key] === undefined) return order === 'asc' ? 1 : -1;
    if (b[key] === null || b[key] === undefined) return order === 'asc' ? -1 : 1;

    if (typeof a[key] === 'string') {
      return order === 'asc'
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    }

    return order === 'asc' ? a[key] - b[key] : b[key] - a[key];
  });
};

// Filter array of objects by search text
export const searchByText = (array, searchText, keys) => {
  if (!searchText) return array;
  
  const lowerSearchText = searchText.toLowerCase();
  
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(lowerSearchText);
    });
  });
};

// Debounce function for search inputs - UPDATED to include .cancel()
export const debounce = (func, wait) => {
  let timeout;

  const debouncedFunction = function(...args) {
    const context = this;
    const later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  // Attach a cancel method to the debounced function
  debouncedFunction.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFunction;
};

// Generate time range options
export const generateTimeRangeOptions = (start = 9, end = 18, interval = 30) => {
  const options = [];
  const totalMinutesInDay = 24 * 60;
  const startMinutes = start * 60;
  const endMinutes = end * 60;
  
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += interval) {
    const hour = Math.floor(minutes / 60) % 24;
    const minute = minutes % 60;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    
    const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    
    options.push({ value, label });
  }
  
  return options;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

// Check if a value is empty (null, undefined, empty string, empty array, empty object)
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};