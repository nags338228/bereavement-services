# Service Filter Application

This project provides a service filter application that helps users filter services based on various criteria like "Who has died?", "Circumstances of death", "Age of person needing support", "Type of support", and "Location". The services are listed and displayed based on the selected filters. Additionally, users can reset the filters with a "Clear All" button.

## Features

- **Dropdown Filters**: Filter services based on different categories such as "Who has died?", "Circumstances of death", "Age of person needing support", "Type of support", and "Location".
- **Dynamic Content Display**: The content updates dynamically as users select filter values.
- **Clear All Filters**: The "Clear All" button allows users to reset all filters and view all services again.
- **Responsive UI**: The interface is responsive and adjusts to different screen sizes.

## Getting Started

### Prerequisites

- A web browser that supports HTML5, CSS3, and JavaScript (such as Chrome, Firefox, Safari, etc.).
- A local server setup to serve the files (e.g., using tools like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for Visual Studio Code or any similar server for static files).

### Installation

1. **Clone the repository** or download the files:

   ```bash
   git clone https://github.com/nags338228/bereavement-services.git
   ```

2. Open the project folder in your preferred code editor.

3. If you're using Visual Studio Code, you can install the "Live Server" extension to view the application directly from your editor. You can right-click on the `index.html` file and click on **Open with Live Server**.

4. Open your browser and visit `http://localhost:8000` (or the port shown by your server).

## Project Structure

/service-filter-app
│
├── index.html # Main HTML file with structure
├── style.css # Styles for the application
├── filterScript.js # JavaScript file handling logic
├── services_converted.json # JSON file with service data
├── README.md # Project documentation

### File Descriptions:

- **index.html**: The main HTML file where the structure of the webpage is defined, including the dropdowns and content section.
- **style.css**: CSS file for the visual styling of the application, including dropdowns, content display, and responsiveness.
- **filterScript.js**: JavaScript file where all the logic for filtering, rendering the content dynamically, and handling the "Clear All" functionality is implemented.
- **services_converted.json**: A JSON file containing the service data to be displayed. The data is used to populate the dropdown filters and the content area.

## How It Works

### Filtering Functionality

1. **Dropdowns**: Each dropdown is populated with unique values from the JSON data.
2. **Change Event**: When a user changes the value in any dropdown, the data is filtered based on the selected filter values.
3. **Displaying Results**: The results are displayed dynamically based on the applied filters. If no results match, a message "No results found" is shown.
4. **Clear All Button**: When the user clicks the "Clear All Filters" button, all dropdowns are reset to their default values (i.e., "All"), and all services are displayed again.

### Example Data Structure in `services_converted.json`

The JSON data consists of an array of service objects, each with several properties corresponding to different categories, such as:

```json
[
	{
		"Title": "*Samaritans - Urgent Help",
		"Who has died?": [
			"Friend/colleague",
			"Unborn baby",
			"Sibling",
			"Grandparent"
		],
		"Circumstances of death": [
			"Neurological",
			"Medical complications",
			"Heart disease/heart attack"
		],
		"Age of person needing support": ["50-65", "65+"],
		"Type of support": ["Helplines"],
		"Location": ["NATIONAL ORGANISATIONS"]
	},
	{
		"Title": "Childline - Urgent Help",
		"Who has died?": ["Sibling", "Parent"],
		"Circumstances of death": ["Illness", "Accident"],
		"Age of person needing support": [
			"Children up to 11",
			"Young people (11-18)"
		],
		"Type of support": ["Helplines"],
		"Location": ["NATIONAL ORGANISATIONS"]
	}
]
```
