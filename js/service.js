function find_in_object(my_object, my_criteria){
	return my_object.filter(function(obj) {
		return Object.keys(my_criteria).every(function(c) {
			return obj[c] == my_criteria[c];
		});
	});
}
//Creates tooltip and makes it invisiblae
var div = d3.select("#service_d3").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
//Width and height of map
var width = 960;
var height = 500;
//Create SVG element and append map to the SVG
var svg = d3.select("#service_d3")
.append("svg")
.attr("width", width)
.attr("height", height);
// add a legend
var w = 140, h = 300;
var key = d3.select("#service_d3")
.append("svg")
.attr("width", w)
.attr("height", h)
.attr("class", "legend");
// var table = d3.select("body").insert("table",":first-child").attr("id","ExpList");
// var thead = table.append("thead");
// var tbody = table.append("tbody");
updateMap(2017);
function updateMap(year) {
	var lowColor = '#eff3ff'
	var highColor = '#084594'
	// D3 Projection
	var projection = d3.geoAlbersUsa()
		.translate([width / 2, height / 2]) // translate to center of screen
		.scale([1000]); // scale things down so see entire US
	// Define path generator
	var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
		.projection(projection); // tell path generator to use albersUsa projection
	// Load in my states data!
	d3.json("data/statesl1.json", function(data) {
		var my_json = JSON.stringify(data); 
						
		var filtered_json = find_in_object(JSON.parse(my_json), {Year: year});
		
		console.log(filtered_json)
		var dataArray = [];
		for (var d = 0; d < data.length; d++) {
			dataArray.push(parseFloat(data[d].Value))
		}
		var minVal = d3.min(dataArray)
		var maxVal = d3.max(dataArray)
		var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
		
		// Load GeoJSON data and merge with states data
		d3.json("data/us-states.json", function(json) {
			//console.log(filtered_json.length);
			//console.log(json.features.length);
			
			// Loop through each state data value in the .csv file
			for (var i = 0; i < filtered_json.length; i++) {
				// Grab State Name
				var dataState = filtered_json[i].GeoName;
				// Grab data value 
				var dataValue = filtered_json[i].Value;
				// Find the corresponding state inside the GeoJSON
				for (var j = 0; j < json.features.length; j++) {
					var jsonState = json.features[j].properties.name;
					if (dataState == jsonState) {
						// Copy the data value into the JSON
						json.features[j].properties.value = dataValue;
						// Stop looking through the JSON
						break;
					}
				}
			}
			
			//console.log(json.features);
			// Bind the data to the SVG and create one path per GeoJSON feature
			svg.selectAll("path").remove();
			
			svg.selectAll("path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.style("stroke", "#fff")
				.style("stroke-width", "1")
				.style("fill", function(d) { return ramp(d.properties.value) })
				//Hovers
				.on("mouseover", function(d) {
					var sel = d3.select(this);
					d3.select(this).transition().duration(300).style("opacity", 0.8);
					div.transition().duration(300)
					.style("opacity", 1);
					div.text(d.properties.name+ ": " + d.properties.value)
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY -30) + "px");
				})
				.on("mouseout", function() {
					var sel = d3.select(this);
					d3.select(this)
					.transition().duration(300)
					.style("opacity", 1);
					div.transition().duration(300)
					.style("opacity", 0);
				});
			var legend = key.append("defs")
				.append("svg:linearGradient")
				.attr("id", "gradient")
				.attr("x1", "100%")
				.attr("y1", "0%")
				.attr("x2", "100%")
				.attr("y2", "100%")
				.attr("spreadMethod", "pad");
			legend.append("stop")
				.attr("offset", "0%")
				.attr("stop-color", highColor)
				.attr("stop-opacity", 1);
				
			legend.append("stop")
				.attr("offset", "100%")
				.attr("stop-color", lowColor)
				.attr("stop-opacity", 1);
			key.append("rect")
			  .attr("width", w - 100)
				.attr("height", h)
				.style("fill", "url(#gradient)")
				.attr("transform", "translate(0,10)");
			var y = d3.scaleLinear()
				.range([h, 0])
				.domain([minVal, maxVal]);
			var yAxis = d3.axisRight(y);
			
			key.selectAll("g").remove();
			key.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(41,10)")
				.call(yAxis);
			// add title 
			svg.selectAll("text").remove();
			svg.append("text")
					.attr("x", (width / 2))             
					.attr("y", 20)
					.attr("text-anchor", "middle")  
					.style("font-size", "16px") 
					.style("fill", "black")
					.style("text-decoration", "underline")  
					.text("Per Capita Expenditures in " + document.getElementById("year").value);
			// Add labels to state tiles	
			svg.selectAll("text")
					.data(json.features)
					.enter()
					.append("svg:text")
					.text(function(d){
						return d.properties.name;
					})
					.attr("x", function(d){
						return path.centroid(d)[0];
					})
					.attr("y", function(d){
						return  path.centroid(d)[1];
					})
					.attr("text-anchor","middle")
					.attr('font-size','6pt');
			// table view
			
			var sortInfo = { key: "GeoName", order: d3.ascending };
			d3.select("#ExpList").remove();
			//d3.select("#ExpList.tbody").remove();
			var table = d3.select("#service_d3").insert("table",":first-child").attr("id","ExpList");
			var thead = table.append("thead");
			var tbody = table.append("tbody");
			thead.append("tr")
			.selectAll("th")
				.data(d3.entries(filtered_json[0]))
				.enter()
				.append("th")
				.on("click", function(d,i){createTableBody(d.key);})
				.text(function(d){return d.key;});
			
			createTableBody("Value");
			function createTableBody(sortKey)
			{
				//sortInfo.order = d3.descending
				if (sortInfo.order.toString() == d3.ascending.toString())
					{ sortInfo.order = d3.descending; }
				else { sortInfo.order = d3.ascending; }
				filtered_json.sort(function(x,y){return sortInfo.order(x[sortKey], y[sortKey])});
				tbody
					.selectAll("tr")
						.data(filtered_json)
						.enter()
						.append("tr")
					.selectAll("td")
						.data(function(d){return d3.entries(d)})
						.enter()
						.append("td")
                        .text(function(d){return d.value;})
                        .attr("font-size",'0.6rem')
					;
				tbody
					.selectAll("tr")
						.data(filtered_json)
					.selectAll("td")
						.data(function(d){return d3.entries(d)})
						.text(function(d){return d.value;})
					;
			}
		});
	});
}