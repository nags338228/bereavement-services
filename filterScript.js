window.onload = function () {
  // Dropdown selectors
  const dropDownSelectors = {
    'whoDied': '.who-has-died select',
    'circumstancesDeath': '.circumstances-death select',
    'agePerson': '.age-person-needing-support select',
    'typeSupport': '.type-support select',
    'location': '.location select'
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
  const totalResults = document.querySelector('.total-results span');
  // Fetch the JSON file and populate the dropdowns
  async function fetchData() {
    try {
      const response = await fetch('./services_converted.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      jsonData = data; // Store the fetched data

      // Populate dropdowns with unique options from JSON
      dropdownKeys.forEach(({ key, selector }) => {
        const dropdownElement = document.querySelector(selector);
        if (dropdownElement) {
          const mergedOptions = [
            ...new Set(
              data.flatMap(item => item[key] || []).sort()
            )
          ];
          populateDropdown(dropdownElement, mergedOptions);
        }
      });

      // Display all data initially
      displayResults(jsonData);
      totalResults.innerHTML = Object.keys(jsonData).length;
    } catch (error) {
      console.error('Error fetching or processing the data:', error);
      showError('Error loading data, please try again later.');
    }
  }

  // Function to sanitize HTML content
  function sanitizeHTML(content) {
    const template = document.createElement('template');
    template.innerHTML = content;
    return template.content.cloneNode(true);
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

  // Attach change event listeners to all dropdowns
  dropdownKeys.forEach(({ selector }) => {
    const dropdownElement = document.querySelector(selector);
    if (dropdownElement) {
      dropdownElement.addEventListener('change', filterResults);
    }
  });

  // Function to filter results based on dropdown selections
  function filterResults() {
    try {
      const filters = {};

      dropdownKeys.forEach(({ key, selector }) => {
        const selectedValue = document.querySelector(selector).value;
        if (selectedValue !== '--') { // Only include selected filters that aren't "All"
          filters[key] = selectedValue;
        }
      });

      const filteredData = jsonData.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return item[key] && item[key].includes(value);
        });
      });

      displayResults(filteredData);
      totalResults.innerHTML = Object.keys(filteredData).length;
    } catch (error) {
      console.error('Error filtering results:', error);
      showError('Error filtering results, please try again.');
    }
  }

  // Function to display results
  function displayResults(data) {
    try {
      const listContent = document.querySelector('.listContent');
      if (!listContent) throw new Error('List content element not found');

      listContent.innerHTML = ''; // Clear previous results

      if (data.length === 0) {
        const noResults = document.createElement('article');
        noResults.className = 'title-post';
        noResults.textContent = 'No results found';
        listContent.appendChild(noResults);
      } else {
        data.forEach(item => {
          const article = document.createElement('article');
          article.className = 'title-post';

          const articleWrapper = document.createElement('div');
          articleWrapper.className = 'title-post-wrapper';

          const titleElement = document.createElement('h2');
          titleElement.textContent = item.Title;

          articleWrapper.appendChild(titleElement); // Append <div class='title-post-wrapper'> to <div class='title-post'>

          if (item.hasOwnProperty('Content')) {
            const contentElement = document.createElement('div');
            contentElement.className = 'title-content';
            const sanitizedContent = sanitizeHTML(item.Content);
            contentElement.appendChild(sanitizedContent);
            articleWrapper.appendChild(contentElement); // Append <div class='title-content'> to <div class='title-post-wrapper'>
          }

          article.appendChild(articleWrapper); // Append <div class='title-post'> to <article>
          // Finally, append all the data to article tag.
          listContent.appendChild(article);
        });
      }
    } catch (error) {
      console.error('Error displaying results:', error);
      showError('Error displaying results, please check the content.');
    }
  }

  // Function to display error messages in the UI
  function showError(message) {
    const listContent = document.querySelector('.listContent');
    if (listContent) {
      listContent.innerHTML = ''; // Clear any previous content
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
    try {
      dropdownKeys.forEach(({ selector }) => {
        const dropdownElement = document.querySelector(selector);
        if (dropdownElement) {
          dropdownElement.value = '--'; // Reset each dropdown to "All"
        }
      });

      // Display all data again after clearing the filters
      displayResults(jsonData);
    } catch (error) {
      console.error('Error clearing filters:', error);
      showError('Error clearing filters, please try again.');
    }
  }

  // Initialize the data fetch on page load
  fetchData();
}