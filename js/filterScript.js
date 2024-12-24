window.onload = function () {
  const dropDownSelectors = {
    whoDied: '.who-has-died select',
    circumstancesDeath: '.circumstances-death select',
    agePerson: '.age-person-needing-support select',
    typeSupport: '.type-support select',
    location: '.location select',
  };

  const dropdownKeys = [
    { key: "Who has died?", selector: dropDownSelectors.whoDied },
    { key: "Circumstances of death", selector: dropDownSelectors.circumstancesDeath },
    { key: "Age of person needing support", selector: dropDownSelectors.agePerson },
    { key: "Type of support", selector: dropDownSelectors.typeSupport },
    { key: "Location", selector: dropDownSelectors.location },
  ];

  let jsonData = [];
  let filteredData = [];
  let displayedData = [];
  const itemsPerLoad = 50; // Number of items to load initially and for each "Load More"
  // const jsonPath = "../services_converted.json";
  const jsonPath = "../bereavement-services.json";
  const totalResultsElement = document.querySelector('.total-results span');

  let itemCategories = [];
  let catWho = [];
  let catCDeath = [];
  let catAgePerson = [];
  let catLocation = [];
  let catType = [];
  async function fetchData() {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      jsonData = data.items;
      filteredData = data.items;

      jsonData.forEach((item) => {
        if (item.categories) {
          itemCategories.push(...item.categories);
        }
      });

      catWho = extractedData('Who:', itemCategories).sort();
      catCDeath = extractedData('Cir:', itemCategories).sort();
      catAgePerson = extractedData('Age:', itemCategories).sort();
      catLocation = extractedData('Location:', itemCategories).sort();
      catType = extractedData('Type:', itemCategories).sort();
      console.log(catWho);
      console.log('----------------------------------------------------');
      console.log(catCDeath);
      console.log('----------------------------------------------------');
      console.log(catAgePerson);
      console.log('----------------------------------------------------');
      console.log(catLocation);
      console.log('----------------------------------------------------');
      console.log(catType);

      populateDropdown(document.querySelector('.who-has-died select'), catWho);
      initializeMultiselect(document.querySelector('.who-has-died select'));

      /*// Populate all dropdowns
      dropdownKeys.forEach(({ key, selector }) => {
        const dropdownElement = document.querySelector(selector);
        if (dropdownElement) {
          const uniqueOptions = [...new Set(data.flatMap(item => item[key] || []))].sort();
          populateDropdown(dropdownElement, uniqueOptions);
          initializeMultiselect(dropdownElement);
        }
      });

      /* // Initially display results
      displayedData = filteredData.slice(0, itemsPerLoad);
      displayResults(displayedData);
      updateLoadMoreButton();
      updateTotalResults(filteredData.length);*/
    } catch (error) {
      console.error('Error fetching or processing the data:', error);
      showError('Error loading data, please try again later.');
    }
  }


  function extractedData(delimiter, dataArrays) {
    const combinedData = [];

    // Iterate through each entry in the data array
    dataArrays.forEach(data => {
      if (data.includes(delimiter) && data.split(delimiter)[1].trim() !== "") {
        combinedData.push(data.split(delimiter)[1].trim());
      }
    });

    // Remove duplicates using a Set
    return [...new Set(combinedData)];
  }

  function populateDropdown(element, options) {
    try {
      if (!element) throw new Error('Dropdown element not found');
      element.innerHTML = '<option value="--">All</option>'; // Reset dropdown
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

  function initializeMultiselect(element) {
    $(element).selectpicker("refresh");
    $(element).selectpicker({
      noneSelectedText: "Select options",
      liveSearch: true,
      actionsBox: true,
      selectAllText: "Select All",
      deselectAllText: "Deselect All",
    });
  }

  function displayResults(data) {
    const regionalSection = document.querySelector('.regional-section-wrapper');
    regionalSection.innerHTML = '';

    if (data.length === 0) {
      regionalSection.innerHTML = '<div class="no-results">No results found</div>';
    } else {
      const html = data.map(item => `
        <div class="card border-0 border-bottom">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <div class='card-text-description'>
              <p class="card-text">${stripHtmlAndLimit(item.body, 100) || 'No description available.'}</p>
            </div>
            
            <button
              class="btn btn-primary read-more mt-3"
              data-bs-toggle="modal"
              data-bs-target="#descriptionModal"
              data-content="${item.body || 'No description available.'}">
              Read More
            </button>
          </div>
        </div>
      `).join('');
      regionalSection.innerHTML += html;
    }
  }

  function stripHtmlAndLimit(text, limit) {
    // Create a temporary DOM element to strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    // Check if the text needs truncation
    if (plainText.length > limit) {
      // Find the last space within the limit to avoid cutting a word
      let truncatedText = plainText.substring(0, limit);
      const lastSpaceIndex = truncatedText.lastIndexOf(' ');

      if (lastSpaceIndex > -1) {
        truncatedText = truncatedText.substring(0, lastSpaceIndex);
      }

      return truncatedText + ' ...';
    }

    return plainText;
  }

  function updateTotalResults(count) {
    totalResultsElement.textContent = count;
  }

  function updateLoadMoreButton() {
    const loadMoreButton = document.getElementById('load-more');
    if (displayedData.length >= filteredData.length) {
      loadMoreButton.style.display = 'none';
    } else {
      loadMoreButton.style.display = 'block';
    }
  }

  document.getElementById('load-more').addEventListener('click', () => {
    const startIndex = displayedData.length;
    const nextBatch = filteredData.slice(startIndex, startIndex + itemsPerLoad);
    displayedData = [...displayedData, ...nextBatch];
    displayResults(displayedData);
    updateLoadMoreButton();
    updateTotalResults(filteredData.length);
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    dropdownKeys.forEach(({ selector }) => {
      const dropdownElement = document.querySelector(selector);
      $(dropdownElement).selectpicker("deselectAll");
      $(dropdownElement).selectpicker("refresh");
    });

    filteredData = jsonData;
    displayedData = filteredData.slice(0, itemsPerLoad);
    displayResults(displayedData);
    updateLoadMoreButton();
    updateTotalResults(filteredData.length);
  });

  dropdownKeys.forEach(({ selector }) => {
    $(document.querySelector(selector)).on('change', filterResults);
  });

  function filterResults() {
    try {
      const filters = {};
      dropdownKeys.forEach(({ key, selector }) => {
        const selectedValues = getSelectedValues(selector);
        if (selectedValues !== null) filters[key] = selectedValues;
      });

      filteredData = jsonData.filter(item => {
        return Object.entries(filters).every(([key, values]) => {
          return values.some(value => item[key]?.includes(value));
        });
      });

      displayedData = filteredData.slice(0, itemsPerLoad);
      displayResults(displayedData);
      updateLoadMoreButton();
      updateTotalResults(filteredData.length);
    } catch (error) {
      console.error('Error filtering results:', error);
      showError('Error filtering results, please try again.');
    }
  }

  function getSelectedValues(selector) {
    const selectedOptions = Array.from(document.querySelector(selector).selectedOptions);
    const values = selectedOptions.map(option => option.value);
    return values.length === 0 || values.includes('--') ? null : values;
  }

  fetchData();
};
