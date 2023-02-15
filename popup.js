// Emty array for storing the search queries
var array = [];

// Sync the array with the local storage in Chrome
chrome.storage.sync.get(["searchQueries"], (res) => {
	array = res.searchQueries ? res.searchQueries : [];
	saveSearchQueries(); // save array to local storage
	updateCounter(); // update the badge in the popup.html
});

// Add listener to check for incoming messeges from content-script.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	let newSearchQueries = request.greeting;
	let convertToArray = JSON.parse(newSearchQueries); // convert the incoming JSON back to an array
	convertToArray.forEach((element) => array.push([element.category, element.subCategory, element.searchQuery, element.metric, element.change])); // add the new search queries to the array
	updateCounter(); // update the badge in the popup.html
	saveSearchQueries(); // save array to local storage
});

/**
 * BUTTONS
 */

// Button: Get Queries - Execute the concent-script.js in the tab for getting the search queries
let button = document.getElementById("get-search-queries").addEventListener("click", async () => {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ["content-script.js"],
	});
});

// Button: Show Array - Shows the content of the array as an alert
let buttonShow = document.getElementById("alert-array").addEventListener("click", async () => {
	let csvArray = [["Category", "Sub Category", "Search Query", "Metric", "Change"]];
	csvArray = csvArray.concat(array);
	let csvString = csvArray.map((row) => row.join(";")).join("\n");
	alert(csvString);
	updateCounter(); // update the badge in the popup.html
});

// Button: Delete - Deletes the content in the array and local storage
let buttonDelete = document.getElementById("empty-array").addEventListener("click", async () => {
	array = []; // override array with an empty array
	updateCounter(); // update the badge in the popup.html
	saveSearchQueries(); // save array to local storage
});

// Button: Downloads - Downloads the array content as a CSV
let buttonDownload = document.getElementById("download-array").addEventListener("click", async () => {
	// Convert array of arrays to CSV string
	let csvArray = [["Category", "Sub Category", "Search Query", "Metric", "Change"]];

	//array = array.concat(["Sub Category", "Search Query", "Metric", "Change"], array);
	csvArray = csvArray.concat(array);
	let csvString = csvArray.map((row) => row.join(";")).join("\n");

	// Create a blob from the CSV string
	let blob = new Blob([csvString], { type: "text/csv" });

	// Create a download link
	let downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = "pmax-search-queries.csv";

	// Append the download link to the body and click it
	document.body.appendChild(downloadLink);
	downloadLink.click();

	// Remove the download link after it's been clicked
	document.body.removeChild(downloadLink);
});

/**
 * Helper Functions
 */

// Function for updating the search query counting badge
function updateCounter() {
	//document.getElementById("number-of-elements").innerHTML = array.length;
	alerticon = document.getElementById("number-of-elements");
	alerticon.setAttribute("data-badge", array.length);
}

// Function to sync the search queries array with the local storage in Chrome
function saveSearchQueries() {
	chrome.storage.sync.set({
		searchQueries: array,
	});
}
