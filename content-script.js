// Get the whole search query table from PMax statistics tab
var htmlCode = document.getElementsByClassName("insights-expand-rows");

// Get the "Search category" and "Search subcategory" for the CSV table
var htmlCodeSubcategory = document.getElementsByClassName("particle-table-row particle-table-row-expanded");
var categoryName = htmlCodeSubcategory[0].querySelector(".cluster-name")?.innerHTML;
var subCategoryName = htmlCodeSubcategory[1].querySelector(".cluster-name")?.innerHTML;

// Emty array for storing the output
var output = [];

// Process each row in the HTML table and save the search queries
for (var i = 0; i < htmlCode.length; i++) {
	htmlRow = htmlCode[i];

	// Check if the HTML row has a sub element with the class ".top-query" = row is a sub category itself
	testSubCategory = htmlRow.querySelector(".top-query")?.innerHTML;

	// if the ".top-query" element is not defined we have a acutual search query row, otherwise skip that row
	if (testSubCategory === undefined) {
		// Decode search query
		var clusterName = htmlRow.querySelector("cluster-name-detail-view-cell div.cluster-name")?.innerHTML?.replace(" &amp; ", " & ");

		// Get the metric and change (in %) value
		var performanceStats = htmlRow.querySelector("consumer-interest-metric")?.innerHTML;
		var metric = "--";
		var change = "--";

		// if performanceStats is available split them into metric and change value
		if (typeof performanceStats == "string") {
			if (performanceStats != "--") {
				var splitArray = performanceStats.split(" (");
				metric = splitArray[0];
				change = cleanString(splitArray[1]);
			}
		}

		// if the search query cell is undefined, skip
		if (clusterName != undefined) {
			output.push({ category: categoryName, subCategory: subCategoryName, searchQuery: clusterName, metric: metric, change: change });
		}
	}
}

// Send the ouput table in JSON format back to the popup.js
chrome.runtime.sendMessage({ greeting: JSON.stringify(output) });

function cleanString(string) {
	newString = string.replace("&nbsp;%)", "%").replace("&gt;", "").replace("--)", "--").replace(" &amp; ", " & ");
	return newString;
}
