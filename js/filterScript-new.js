// Configuration Variables
const ITEMS_PER_PAGE = 20; // Number of items per page
const MAX_VISIBLE_PAGES = 9; // Maximum visible pages in pagination
const JSON_FILE_PATH = "https://raw.githubusercontent.com/nags338228/bereavement-services/master/services_converted.json"; // JSON file path

/**
 * Initialize Choices.js on all dropdowns.
 * Enhances dropdowns to support multi-select, search, and dynamic UI improvements.
 * Includes error handling to check if Choices.js is loaded.
 */
function initializeChoices() {
  const selectElements = document.querySelectorAll('select[data-choice]');
  if (typeof Choices === 'undefined') {
    console.warn("Choices.js library is not loaded. Falling back to vanilla dropdowns.");
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
        shouldSortItems: false,
        shouldSort: true,
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

  Object.keys(filters).forEach((key) => {
    const selectElement = filters[key];
    const uniqueOptions = new Set();

    data.forEach((item) => {
      if (item[key]) {
        item[key].forEach((option) => uniqueOptions.add(option));
      }
    });

    const options = Array.from(uniqueOptions).sort();
    selectElement.innerHTML = `
      <option value="--">All</option>
      ${options.map((option) => `<option value="${option}">${option}</option>`).join("")}
    `;
  });

  initializeChoices();
}

/**
 * Render paginated content dynamically based on the filtered results.
 */
function renderContent(data, currentPage = 1) {
  const nationalWrapper = document.querySelector('.national-section-wrapper');
  const localWrapper = document.querySelector('.local-section-wrapper');
  const totalResults = document.querySelector('.total-results span');

  nationalWrapper.innerHTML = "";
  localWrapper.innerHTML = "";

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(start, start + ITEMS_PER_PAGE);

  const locationFilterApplied = getSelectedValues(document.querySelector('.location select')).length > 0 &&
    !getSelectedValues(document.querySelector('.location select')).includes('--');

  paginatedData.forEach((item) => {
    const section = locationFilterApplied && item.Location && item.Location.length > 0 ? localWrapper : nationalWrapper;

    section.innerHTML += `
      <div class="card">
        <div class="card-data">
          <h3>${item.Title}</h3>
          <p>${item.Content || 'No description available.'}</p>
        </div>
        <div class="arrow">&gt;</div>
      </div>
    `;
  });

  totalResults.textContent = data.length;
  setupPagination(data, currentPage);
}

/**
 * Setup pagination dynamically for the filtered results.
 * @param {Array} data - Filtered data to paginate.
 * @param {Number} currentPage - Current active page number.
 */
function setupPagination(data, currentPage) {
  const paginationWrapper = document.querySelector('.pagination');
  paginationWrapper.innerHTML = "";

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
  const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

  let paginationHTML = "";

  if (currentPage > 1) {
    paginationHTML += `<button class="pagination-button" data-page="${currentPage - 1}">Back</button>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-button ${i === currentPage ? "active" : ""}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination-button" data-page="${currentPage + 1}">Next</button>`;
  }

  paginationWrapper.innerHTML = paginationHTML;

  paginationWrapper.querySelectorAll(".pagination-button").forEach((button) => {
    button.addEventListener("click", () => {
      const page = parseInt(button.dataset.page);
      renderContent(data, page);
    });
  });
}

/**
 * Fetch the JSON file, handle errors gracefully, and initialize the application.
 */
function initialize() {
  fetch(JSON_FILE_PATH)
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
}

/**
 * Get selected values from a multiselect dropdown.
 */
function getSelectedValues(selectElement) {
  return Array.from(selectElement.selectedOptions).map((option) => option.value);
}

/**
 * Clear all filters and reset the dropdowns and content.
 */
function clearFilters(data) {
  const selectElements = document.querySelectorAll('select[data-choice]');
  selectElements.forEach((select) => {
    if (typeof select.choicesInstance !== "undefined") {
      select.choicesInstance.removeActiveItems();
    } else {
      select.selectedIndex = 0;
    }
  });

  renderContent(data);
}

// Start the script when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initialize);
