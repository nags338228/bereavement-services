window.onload = function () {
  // Dropdown selectors
  const dropDownSelectors = {
    whoDied: '.who-has-died select',
    circumstancesDeath: '.circumstances-death select',
    agePerson: '.age-person-needing-support select',
    typeSupport: '.type-support select',
    location: '.location select'
  };

  // Data from json file and its headers
  const dropdownKeys = [
    { key: "Who has died?", selector: dropDownSelectors.whoDied },
    { key: "Circumstances of death", selector: dropDownSelectors.circumstancesDeath },
    { key: "Age of person needing support", selector: dropDownSelectors.agePerson },
    { key: "Type of support", selector: dropDownSelectors.typeSupport },
    { key: "Location", selector: dropDownSelectors.location }
  ];

  let jsonData = []; // To hold the fetched data
  let filteredData = []; // To hold the filtered data
  let currentPage = 1; // Tracks the current page
  const itemsPerPage = 20; // Number of items per page
  const visiblePages = 9; // Number of pages to display at a time
  const totalResults = document.querySelector('.total-results span'); // Total count of results

  // Fetch the JSON file and populate the dropdowns
  async function fetchData() {
    try {
      const response = await fetch('./services_converted.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      jsonData = data; // Store the fetched data
      filteredData = data; // Initially, no filter, so filtered data is same as original

      // Populate dropdowns with unique options
      dropdownKeys.forEach(({ key, selector }) => {
        const dropdownElement = document.querySelector(selector);
        if (dropdownElement) {
          const mergedOptions = [...new Set(data.flatMap(item => item[key] || []))];
          populateDropdown(dropdownElement, mergedOptions);
        }
      });

      // Display the first page of results
      const firstPageData = paginate(filteredData, currentPage, itemsPerPage);
      displayResults(firstPageData);
      setupPagination(filteredData.length);
      totalResults.innerHTML = Object.keys(jsonData).length;
    } catch (error) {
      console.error('Error fetching or processing the data:', error);
      showError('Error loading data, please try again later.');
    }
  }

  // Function to populate dropdown options
  function populateDropdown(element, options) {
    try {
      if (!element) throw new Error('Dropdown element not found');
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

  // Function to filter results based on selected dropdown values
  function filterResults() {
    try {
      const filters = {};
      dropdownKeys.forEach(({ key, selector }) => {
        const selectedValue = document.querySelector(selector).value;
        if (selectedValue !== '--') { // Only include selected filters that aren't "All"
          filters[key] = selectedValue;
        }
      });

      // Apply filters to data
      filteredData = jsonData.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return item[key] && item[key].includes(value);
        });
      });

      // Reset to the first page and display filtered data
      currentPage = 1;
      const firstPageData = paginate(filteredData, currentPage, itemsPerPage);
      displayResults(firstPageData);
      setupPagination(filteredData.length);
      totalResults.innerHTML = Object.keys(filteredData).length;
    } catch (error) {
      console.error('Error filtering results:', error);
      showError('Error filtering results, please try again.');
    }
  }

  // Function to paginate the data
  function paginate(data, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }

  // Function to display the results
  function displayResults(data) {
    try {
      const nationalSection = document.querySelector('.national-section-wrapper');
      const localSection = document.querySelector('.local-section-wrapper');

      if (!nationalSection || !localSection) {
        throw new Error('Section elements not found in the DOM');
      }

      nationalSection.innerHTML = '';
      localSection.innerHTML = '';

      if (data.length === 0) {
        nationalSection.innerHTML = '<div class="no-results">No results found</div>';
        localSection.innerHTML = '<div class="no-results">No results found</div>';
      } else {
        let nationalHTML = '';
        let localHTML = '';

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

          if (item.Location && item.Location.length > 0) {
            localHTML += cardHTML;
          } else {
            nationalHTML += cardHTML;
          }
        });

        localSection.innerHTML = localHTML;
        nationalSection.innerHTML = nationalHTML;
      }
    } catch (error) {
      console.error('Error displaying results:', error);
      showError('Error displaying results, please check the content.');
    }
  }

  // Function to setup pagination
  function setupPagination(totalItems) {
    const paginationWrapper = document.querySelector('.pagination');
    if (!paginationWrapper) {
      throw new Error('Pagination wrapper not found in the DOM');
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const rangeStart = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const rangeEnd = Math.min(totalPages, rangeStart + visiblePages - 1);

    let paginationHTML = '';

    // Create "Back" button
    if (currentPage > 1) {
      paginationHTML += `<button class="page-btn back-btn" data-page="${currentPage - 1}">&lt; Back</button>`;
    }

    // Display the page numbers
    for (let i = rangeStart; i <= rangeEnd; i++) {
      const activeClass = i === currentPage ? 'active' : '';
      paginationHTML += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
    }

    // Create "Next" button
    if (currentPage < totalPages) {
      paginationHTML += `<button class="page-btn next-btn" data-page="${currentPage + 1}">Next &gt;</button>`;
    }

    paginationWrapper.innerHTML = paginationHTML;
    attachPaginationEvents();
  }

  // Attach pagination events
  function attachPaginationEvents() {
    document.querySelectorAll('.page-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const selectedPage = parseInt(e.target.dataset.page);
        if (selectedPage) {
          currentPage = selectedPage;
          const pagedData = paginate(filteredData, currentPage, itemsPerPage);
          displayResults(pagedData);
          setupPagination(filteredData.length);
          totalResults.innerHTML = Object.keys(filteredData).length;
        }
      });
    });
  }

  // Show error message
  function showError(message) {
    const listContent = document.querySelector('.listContent');
    if (listContent) {
      listContent.innerHTML = '';
      const errorMessage = document.createElement('article');
      errorMessage.className = 'title-post error';
      errorMessage.textContent = message;
      listContent.appendChild(errorMessage);
    }
  }

  // Add functionality for "Clear All Filters" button
  document.getElementById('clear-filters').addEventListener('click', clearFilters);

  // Function to clear all filters and reset dropdowns
  function clearFilters() {
    dropdownKeys.forEach(({ selector }) => {
      const dropdownElement = document.querySelector(selector);
      if (dropdownElement) {
        dropdownElement.value = '--';
      }
    });

    currentPage = 1;
    filteredData = jsonData;
    const firstPageData = paginate(filteredData, currentPage, itemsPerPage);
    displayResults(firstPageData);
    setupPagination(filteredData.length);
    totalResults.innerHTML = Object.keys(filteredData).length;
  }

  // Initialize fetch data and setup filters
  fetchData();

  // Attach event listeners to dropdown changes
  dropdownKeys.forEach(({ selector }) => {
    const dropdownElement = document.querySelector(selector);
    if (dropdownElement) {
      dropdownElement.addEventListener('change', filterResults);
    }
  });
};
