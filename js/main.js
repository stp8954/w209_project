  var multi_chart_wage =
  {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "description": "Google's stock price over time.",
    "width": 500,
    "height": 100,
    "data": {
        "name":"myData"
     },
    "mark": "line",
    "encoding": {
      "x": {"field": "year", "type": "temporal"},
      "y": {"field": "A_MEDIAN", "type": "quantitative"}
    }
  };

  var multi_chart_rpp =
  {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "description": "Google's stock price over time.",
    "width": 500,
    "height": 100,
    "data": {
        "name":"myData"
     },
    "mark": "line",
    "encoding": {
      "x": {"field": "year", "type": "temporal"},
      "y": {"field": "CPI", "type": "quantitative"}
    }
  };
  
 var stacked_charts = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "title": "Seattle Weather, 2012-2015",
    "data": {
      "name":"myData"
    },

 }

function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};

function filterOcc(data, state, occupation){

    return data.filter(function(d){
        if (d.ST == state & d.OCC_TITLE == occupation ){
            return true;
        }
        return false;
    });
}

function filterRpp(data, state){

    return data.filter(function(d){
        if (d.State == state ){
            return true;
        }
        return false;
    });
}

var wage_data;
var rpp_data;
vega_data = [];
var st = "WA"
var state = 'Washington'

function updateCharts(){
    var state_wage_data = filterOcc(wage_data,st,"Software Developers Applications");
    var state_rpp_data = filterRpp(rpp_data,state);

    var result = join(state_rpp_data, state_wage_data, "State","STATE", function(wage, rpp){

        return {
            "ST":wage.ST,
            "State":rpp.State,
            "A_MEDIAN": wage.A_MEDIAN,
            "CPI": rpp.CPI
        }
    });
    
    vegaEmbed("#salary", multi_chart_wage)
        .then((res) => res.view
        .insert("myData", state_wage_data)
        .run()
    );

    vegaEmbed("#cpi", multi_chart_rpp)
        .then((res) => res.view
        .insert("myData", state_rpp_data)
        .run()
    );
}


 d3.select(".state_picker").on("change", function(){
    st = d3.select(this).node().value;
    state = d3.select(this).select("[value='" + st + "']").text();
    updateCharts();
});


  d3.queue()
  .defer(d3.csv, "/data/rpp_2007_2016.csv")
  .defer(d3.csv, "/data/wages_2007_2016_2.csv")
  .await(analyze);


function analyze(error, rpp, wages){
  
    if(error){console.log(error);}

    wage_data = wages;
    rpp_data = rpp;

    updateCharts();
};

  // Embed the visualization in the container with id `vis`
  // vegaEmbed("#vis", vlSpec);

  