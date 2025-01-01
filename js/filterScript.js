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
  let whoCat = [];
  let catCDeath = [];
  let cDeathCat = [];
  let catAgePerson = [];
  let agePersonCat = [];
  let catLocation = [];
  let locationCat = [];
  let catType = [];
  let typeCat = [];
  const itemsPerLoad = 5; // Number of items to load initially and for each "Load More"
  // const jsonPath = "https://arjun-testing-ataloss.squarespace.com/more-info/bereavement-services?format=json";
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
        catWho = extractedData('Who:', item.categories).sort()
        catCDeath = extractedData('Cir:', item.categories).sort()
        catAgePerson = extractedData('Age:', item.categories).sort()
        catLocation = extractedData('Location:', item.categories).sort()
        catType = extractedData('Type:', item.categories).sort()
        requiredData = [{
          "title": item.title,
          "body": item.body,
          "featured": item.starred,
          "catWho": catWho,
          "catCDeath": catCDeath,
          "catAgePerson": catAgePerson,
          "catLocation": catLocation,
          "catType": catType,
        }];

        // Push the data into new array for dropdowns and after extraction
        jsonData.push(...requiredData);
        whoCat = [...new Set([...whoCat, ...catWho])].sort();
        cDeathCat = [...new Set([...cDeathCat, ...catCDeath])].sort();
        agePersonCat = [...new Set([...agePersonCat, ...catAgePerson])].sort();
        locationCat = [...new Set([...locationCat, ...catLocation])].sort();
        typeCat = [...new Set([...typeCat, ...catType])].sort();
      });
      filteredData = jsonData;
      wholeCategories = {
        'catWho': whoCat,
        'catCDeath': cDeathCat,
        'catAgePerson': agePersonCat,
        'catLocation': locationCat,
        'catType': typeCat,
      };

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
    const nationalSection = document.querySelector('.national-section-wrapper');
    const featuredSection = document.querySelector('.featured-section-wrapper');
    regionalSection.innerHTML = '';
    nationalSection.innerHTML = '';
    featuredSection.innerHTML = '';

    if (data.length === 0) {
      regionalSection.innerHTML = '<div class="no-results">No results found</div>';
      return;
    }
    // Iterate through filtered data and append to respective sections
    data.forEach((item) => {
      const card = `
          <div class="card border-0 border-bottom">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <div class='card-text-description'>
              <p class="card-text">${stripHtmlAndLimit(item.body, 100) || 'No description available.'}</p>
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
              ${item.body || 'No description available.'}
            </div>
          </div>
        </div>
      `;

      if (item.featured) {
        featuredSection.innerHTML += card;
      } else {
        regionalSection.innerHTML += card;
      }
    });
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
          let categoryArray = Array.isArray(item[key]) ? item[key] : (item[key] ? [item[key]] : []);
          return values.some(value =>
            categoryArray.some(cat => cat.trim().toLowerCase() === value.trim().toLowerCase())
          );
        });
      });

      displayedData = filteredData.slice(0, itemsPerLoad);
      // console.log(filteredData)
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
