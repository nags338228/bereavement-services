window.addEventListener("load", function () {
  const dropdownKeys = [
    { key: "catWho", selector: '.who-has-died select' },
    { key: "catCDeath", selector: '.circumstances-death select', },
    { key: "catAgePerson", selector: '.age-person-needing-support select' },
    { key: "catType", selector: '.type-support select' },
    { key: "catLocation", selector: '.location select' },
  ];

  let jsonData = [];
  let filteredData = [];
  let displayedData = [];
  let wholeCategories = {};
  let catWho = [];
  let catCDeath = [];
  let catAgePerson = [];
  let catLocation = [];
  let catType = [];
  const itemsPerLoad = 50; // Number of items to load initially and for each "Load More"
  // const jsonPath = "../services_converted.json";
  const jsonPath = "../bereavement-services.json";
  const totalResultsElement = document.querySelector('.total-results span');

  let itemCategories = [];
  async function fetchData() {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      originalData = data.items;

      originalData.forEach((item) => {

        if (item.categories) {
          itemCategories.push(...item.categories);
        }
        catWho = extractedData('Who:', itemCategories).sort()
        catCDeath = extractedData('Cir:', itemCategories).sort()
        catAgePerson = extractedData('Age:', itemCategories).sort()
        catLocation = extractedData('Location:', itemCategories).sort()
        catType = extractedData('Type:', itemCategories).sort()
        requiredData = [{
          "Title": item.title,
          "Content": item.body,
          "catWho": catWho,
          "catCDeath": catCDeath,
          "catAgePerson": catAgePerson,
          "catLocation": catLocation,
          "catType": catType,
        }];
        jsonData.push(...requiredData);
      });
      filteredData = jsonData;

      wholeCategories = {
        'catWho': catWho,
        'catCDeath': catCDeath,
        'catAgePerson': catAgePerson,
        'catLocation': catLocation,
        'catType': catType,
      };
      console.log(jsonData)
      console.log(filteredData)

      dropdownKeys.forEach((item) => {
        populateDropdown(document.querySelector(item.selector), wholeCategories[item.key]);
        initializeMultiselect(document.querySelector(item.selector));
      });

      // Initially display results
      displayedData = filteredData.slice(0, itemsPerLoad);
      displayResults(displayedData);
      updateLoadMoreButton();
      updateTotalResults(filteredData.length);
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
            <h5 class="card-title">${item.Title}</h5>
            <div class='card-text-description'>
              <p class="card-text">${stripHtmlAndLimit(item.Content, 100) || 'No description available.'}</p>
            </div>
            <button
              class="btn btn-primary read-more mt-3"
              data-bs-toggle="modal"
              data-id="cardDescription"
              data-bs-target="#descriptionModal"
              data-content="${'No description available.'}">
              Read More
            </button>
            <div class='card-description-hidden d-none' id="cardDescription">
              ${item.Content || 'No description available.'}
            </div>
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
    console.log(dropdownKeys)
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
      console.log(displayedData)
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
});
