// Configuration Variables
const ITEMS_PER_PAGE = 20; // Number of items per page
const MAX_VISIBLE_PAGES = 9; // Maximum visible pages in pagination

/**
 * Initialize Choices.js on all dropdowns.
 * Enhances dropdowns to support multi-select, search, and dynamic UI improvements.
 * Includes error handling to check if Choices.js is loaded.
 */
function initializeChoices() {
  const selectElements = document.querySelectorAll('select[data-choice]');
  if (typeof Choices === 'undefined') {
    console.error("Choices.js library is not loaded. Please include the script in your HTML.");
    return;
  }

  selectElements.forEach((select) => {
    try {
      new Choices(select, {
        removeItemButton: true,
        searchEnabled: true,
        placeholderValue: 'Select options',
        noResultsText: 'No results found',
        noChoicesText: 'No choices to choose from',
        allowHTML: true,
      });
    } catch (error) {
      console.error("Error initializing Choices.js for:", select, error);
    }
  });
}

/**
 * Populate dropdown filters dynamically based on JSON data.
 * Ensures "All" option is always first, and other options are sorted alphabetically.
 */
function populateFilters(data) {
  const filters = {
    "Who has died?": document.querySelector('.who-has-died select'),
    "Circumstances of death": document.querySelector('.circumstances-death select'),
    "Age of person needing support": document.querySelector('.age-person-needing-support select'),
    "Type of support": document.querySelector('.type-support select'),
    "Location": document.querySelector('.location select'),
  };

  try {
    Object.keys(filters).forEach((key) => {
      const selectElement = filters[key];
      const uniqueOptions = new Set();

      // Collect unique options for each filter
      data.forEach((item) => {
        if (item[key]) {
          item[key].forEach((option) => uniqueOptions.add(option));
        }
      });

      // Add "All" option and sort remaining options alphabetically
      const options = Array.from(uniqueOptions).sort();
      selectElement.innerHTML = '';
      const allOption = document.createElement('option');
      allOption.value = '--';
      allOption.textContent = 'All';
      selectElement.appendChild(allOption);

      options.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
      });
    });

    // Initialize Choices.js after populating options
    initializeChoices();
  } catch (error) {
    console.error("Error populating filters:", error);
  }
}

/**
 * Render paginated content dynamically based on the filtered results.
 */
function renderContent(data, currentPage = 1) {
  const nationalWrapper = document.querySelector('.national-section-wrapper');
  const localWrapper = document.querySelector('.local-section-wrapper');
  const totalResults = document.querySelector('.total-results span');
  const pagination = document.querySelector('.pagination');

  // Clear previous content and pagination
  nationalWrapper.innerHTML = '';
  localWrapper.innerHTML = '';
  pagination.innerHTML = '';

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(start, start + ITEMS_PER_PAGE);

  // Check if Location filter is applied
  const locationFilterApplied = getSelectedValues(document.querySelector('.location select')).length > 0 &&
    !getSelectedValues(document.querySelector('.location select')).includes('--');

  try {
    // Render paginated content
    paginatedData.forEach((item) => {
      const section =
        locationFilterApplied && item.Location && item.Location.length > 0
          ? localWrapper
          : nationalWrapper;

      const card = document.createElement('div');
      card.classList.add('section-wrapper');

      const content = document.createElement('div');
      content.classList.add('content-wrapper');
      content.innerHTML = `<h2>${item.Title}</h2><p>${item.Content || 'No description available.'}</p>`;

      const arrow = document.createElement('div');
      arrow.classList.add('arrow-wrapper');
      arrow.innerHTML = '&gt;';

      card.appendChild(content);
      card.appendChild(arrow);
      section.appendChild(card);
    });

    // Update total results
    totalResults.textContent = totalItems;

    // Create pagination
    const startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
    const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

    if (currentPage > 1) {
      const backButton = document.createElement('button');
      backButton.textContent = 'Back';
      backButton.classList.add('pagination-button');
      backButton.addEventListener('click', () => renderContent(data, currentPage - 1));
      pagination.appendChild(backButton);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('pagination-button');
      if (i === currentPage) pageButton.classList.add('active');
      pageButton.addEventListener('click', () => renderContent(data, i));
      pagination.appendChild(pageButton);
    }

    if (currentPage < totalPages) {
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.classList.add('pagination-button');
      nextButton.addEventListener('click', () => renderContent(data, currentPage + 1));
      pagination.appendChild(nextButton);
    }
  } catch (error) {
    console.error("Error rendering content:", error);
  }
}

/**
 * Fetch the JSON file, handle errors gracefully, and initialize the application.
 */
function initialize() {
  fetch('./services_converted.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      populateFilters(data);
      renderContent(data);

      document.querySelectorAll('select[data-choice]').forEach((select) => {
        select.addEventListener('change', () => applyFilters(data));
      });

      document.querySelector('#clear-filters').addEventListener('click', () => clearFilters(data));
    })
    .catch((error) => {
      console.error("Error loading or initializing data:", error);
      alert("An error occurred while loading the application. Please try again later.");
    });
}

/**
 * Apply filters to the data and update the content dynamically.
 */
function applyFilters(data) {
  try {
    const filters = {
      "Who has died?": getSelectedValues(document.querySelector('.who-has-died select')),
      "Circumstances of death": getSelectedValues(document.querySelector('.circumstances-death select')),
      "Age of person needing support": getSelectedValues(document.querySelector('.age-person-needing-support select')),
      "Type of support": getSelectedValues(document.querySelector('.type-support select')),
      "Location": getSelectedValues(document.querySelector('.location select')),
    };

    const filteredData = data.filter((item) => {
      return Object.keys(filters).every((key) => {
        const selectedValues = filters[key];
        return (
          selectedValues.length === 0 ||
          selectedValues.includes('--') ||
          (item[key] && selectedValues.some((value) => item[key].includes(value)))
        );
      });
    });

    renderContent(filteredData);
  } catch (error) {
    console.error("Error applying filters:", error);
  }
}

/**
 * Get selected values from a multiselect dropdown.
 */
function getSelectedValues(selectElement) {
  try {
    return Array.from(selectElement.selectedOptions).map((option) => option.value);
  } catch (error) {
    console.error("Error getting selected values:", error);
    return [];
  }
}

/**
 * Clear all filters and reset the dropdowns and content.
 */
function clearFilters(data) {
  try {
    const selectElements = document.querySelectorAll('select[data-choice]');
    selectElements.forEach((select) => {
      console.log(select)
      const choicesInstance = select.choicesInstance;
      if (choicesInstance) choicesInstance.removeActiveItems();
    });
    renderContent(data);
  } catch (error) {
    console.error("Error clearing filters:", error);
  }
}

// Start the script when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);
