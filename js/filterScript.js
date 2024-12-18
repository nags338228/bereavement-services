window.onload = function () {
  // Selectors for dropdown fields
  const dropDownSelectors = {
    whoDied: '.who-has-died select',
    circumstancesDeath: '.circumstances-death select',
    agePerson: '.age-person-needing-support select',
    typeSupport: '.type-support select',
    location: '.location select',
  };

  // Mapping dropdown keys to JSON fields for filtering
  const dropdownKeys = [
    { key: "Who has died?", selector: dropDownSelectors.whoDied },
    { key: "Circumstances of death", selector: dropDownSelectors.circumstancesDeath },
    { key: "Age of person needing support", selector: dropDownSelectors.agePerson },
    { key: "Type of support", selector: dropDownSelectors.typeSupport },
    { key: "Location", selector: dropDownSelectors.location },
  ];

  let jsonData = []; // Stores the complete dataset
  let filteredData = []; // Stores the dataset after applying filters
  let currentPage = 1; // Tracks the current page for pagination
  const itemsPerPage = 20; // Number of items to display per page
  const visiblePages = 9; // Number of pagination buttons to display at once
  const totalResults = document.querySelector('.total-results span'); // Element showing total results
  // const jsonPath = "https://raw.githubusercontent.com/nags338228/bereavement-services/master/services_converted.json";
  const jsonPath = "./services_converted.json";

  /**
   * Fetch the JSON data from the server.
   * Handles errors in case the file is not found or corrupted.
   */
  async function fetchData() {
    try {
      const response = await fetch(jsonPath); // JSON file location
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json(); // Parse JSON data
      jsonData = data; // Store the fetched data
      filteredData = data; // Initially, no filter, so filtered data is same as original

      // Populate dropdowns with unique values from JSON fields
      dropdownKeys.forEach(({ key, selector }) => {
        const dropdownElement = document.querySelector(selector);
        if (dropdownElement) {
          const mergedOptions = [...new Set(data.flatMap(item => item[key] || []))].sort();
          populateDropdown(dropdownElement, mergedOptions);
        }
      });

      // Initial rendering of data and pagination
      displayResults(paginate(filteredData, currentPage, itemsPerPage));
      setupPagination(filteredData.length);
      totalResults.innerHTML = jsonData.length; // Display total items count
    } catch (error) {
      console.error('Error fetching or processing the data:', error);
      showError('Error loading data, please try again later.');
    }
  }

  /**
   * Populate a dropdown with given options.
   * Adds an "All" option to represent no filtering for that dropdown.
   * @param {HTMLElement} element - The dropdown element to populate.
   * @param {Array<string>} options - The list of options to populate.
   */
  function populateDropdown(element, options) {
    try {
      if (!element) throw new Error('Dropdown element not found');
      // Populate the dropdown with unique values
      options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        element.appendChild(optionElement);
      });
    } catch (error) {
      console.error('Error populating dropdown:', error);
      showError('Error populating dropdown, please check the data.');
    }
  }

  /**
   * Get selected values from a multi-select dropdown.
   * Returns null if "All" or no selection is made.
   * @param {string} selector - The selector for the dropdown element.
   * @returns {Array<string>|null} - The selected values or null for no filtering.
   */
  function getSelectedValues(selector) {
    const selectedOptions = Array.from(document.querySelector(selector).selectedOptions);
    const values = selectedOptions.map(option => option.value);

    // Return null if "All" is selected or no selection is made
    if (values.length === 0 || values.includes('--')) {
      return null;
    }

    return values;
  }

  /**
   * Apply filters to the data based on selected dropdown values.
   * Resets pagination and updates the displayed results.
   */
  function filterResults() {
    try {
      const filters = {};
      // Build filters based on selected values in dropdowns
      dropdownKeys.forEach(({ key, selector }) => {
        const selectedValues = getSelectedValues(selector);
        if (selectedValues !== null) { // Exclude dropdowns with "All" selected
          filters[key] = selectedValues;
        }
      });

      // Apply filters to the dataset
      filteredData = jsonData.filter(item => {
        return Object.entries(filters).every(([key, values]) => {
          return values.some(value => item[key]?.includes(value));
        });
      });

      // Reset pagination and render filtered results
      currentPage = 1;
      displayResults(paginate(filteredData, currentPage, itemsPerPage));
      setupPagination(filteredData.length);
      totalResults.innerHTML = filteredData.length; // Update results count
    } catch (error) {
      console.error('Error filtering results:', error);
      showError('Error filtering results, please try again.');
    }
  }

  /**
   * Paginate the dataset.
   * @param {Array<object>} data - The dataset to paginate.
   * @param {number} page - The current page number.
   * @param {number} itemsPerPage - The number of items per page.
   * @returns {Array<object>} - The paginated dataset for the current page.
   */
  function paginate(data, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }

  /**
   * Render the paginated results into the "Local to You" and "National" sections.
   * Items with a matching location filter are displayed in "Local to You".
   * All other items are displayed in "National".
   * @param {Array<object>} data - The data to display.
   */
  function displayResults(data) {
    const nationalSection = document.querySelector('.national-section-wrapper');
    const localSection = document.querySelector('.local-section-wrapper');

    nationalSection.innerHTML = '';
    localSection.innerHTML = '';

    if (data.length === 0) {
      nationalSection.innerHTML = '<div class="no-results">No results found</div>';
      localSection.innerHTML = '<div class="no-results">No results found</div>';
    } else {
      let nationalHTML = '';
      let localHTML = '';

      const selectedLocations = getSelectedValues(dropDownSelectors.location);

      data.forEach(item => {
        const cardHTML = `
          <div class="card">
            <div class="card-data">
              <h3>${item.Title}</h3>
              <p>${item.Content || 'No description available.'}</p>
            </div>
            <div class="arrow">&gt;</div>
          </div>
        `;

        if (selectedLocations && item.Location?.some(loc => selectedLocations.includes(loc))) {
          localHTML += cardHTML; // Matches selected locations, go to "Local to You"
        } else {
          nationalHTML += cardHTML; // Everything else goes to "National"
        }
      });

      localSection.innerHTML = localHTML;
      nationalSection.innerHTML = nationalHTML;
    }
  }

  /**
   * Setup pagination controls for the dataset.
   * @param {number} totalItems - The total number of items in the dataset.
   */
  function setupPagination(totalItems) {
    const paginationWrapper = document.querySelector('.pagination');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const rangeStart = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const rangeEnd = Math.min(totalPages, rangeStart + visiblePages - 1);

    let paginationHTML = '';

    // "Back" button
    if (currentPage > 1) {
      paginationHTML += `<button class="page-btn back-btn" data-page="${currentPage - 1}">&lt; Back</button>`;
    }

    // Page numbers
    for (let i = rangeStart; i <= rangeEnd; i++) {
      const activeClass = i === currentPage ? 'active' : '';
      paginationHTML += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
    }

    // "Next" button
    if (currentPage < totalPages) {
      paginationHTML += `<button class="page-btn next-btn" data-page="${currentPage + 1}">Next &gt;</button>`;
    }

    paginationWrapper.innerHTML = paginationHTML;

    // Attach click events to pagination buttons
    document.querySelectorAll('.page-btn').forEach(button => {
      button.addEventListener('click', e => {
        currentPage = parseInt(e.target.dataset.page);
        displayResults(paginate(filteredData, currentPage, itemsPerPage));
        setupPagination(filteredData.length);
      });
    });
  }

  /**
   * Display an error message in the results section.
   * @param {string} message - The error message to display.
   */
  function showError(message) {
    const listContent = document.querySelector('.listContent');
    listContent.innerHTML = `<div class="error">${message}</div>`;
  }

  // Clear all filters and reset the dataset
  document.getElementById('clear-filters').addEventListener('click', () => {
    dropdownKeys.forEach(({ selector }) => {
      const dropdownElement = document.querySelector(selector);
      Array.from(dropdownElement.options).forEach(option => (option.selected = false));
    });

    currentPage = 1;
    filteredData = jsonData;
    displayResults(paginate(filteredData, currentPage, itemsPerPage));
    setupPagination(filteredData.length);
    totalResults.innerHTML = jsonData.length;
  });

  dropdownKeys.forEach(({ selector }) => {
    document.querySelector(selector).addEventListener('change', filterResults);
  });

  fetchData();
};
