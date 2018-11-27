  
var stacked_charts = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "title": "State Wage and RPP data",
    "data": {
        "name":"wageData"
    },
    "transform": [
        {
            "filter": {
                "and": [
                    "datum.year == 2016"
                ]
            }
        }
    ],
    "vconcat": [
        {
            "encoding": {
                "x": {
                    "axis": { "title": "Date"},
                    "field": "year",
                    "type": "temporal"
                },
                "y": {
                    "axis": { "title": "Median Salary" },
                    "field": "A_MEDIAN",
                    "scale": { "domain": [0, 200000] },
                    "type": "quantitative"
                }
            },
            "width": 600,
            "mark": { "type": "line", "color": "green", "point": { "color": "red" } },
            "selection": { "brush": { "encodings": ["x"], "type": "interval" } },
        }, {
            "encoding": {
                "x": {
                    "axis": { "title": "Date" },
                    "field": "year",
                    "type": "temporal"
                },
                "y": {
                    "axis": { "title": "Median Salary" },
                    "field": "CPI",
                    "scale": { "domain": [50, 150] },
                    "type": "quantitative"
                }
            },
            "width": 600,
            "mark": { "type": "line", "color": "green", "point": { "color": "red" } },
            "transform": [{ "filter": { "selection": "brush" } }]
        }, {
            "encoding": {
                "x": {
                    "axis": { "title": "Date" },
                    "field": "year",
                    "type": "temporal"
                },
                "y": {
                    "axis": { "title": "Adjusted Median Salary" },
                    "field": "A_MEDIAN_ADJ",
                    "scale": { "domain": [0, 200000] },
                    "type": "quantitative"
                }
            },
            "width": 600,
            "mark": { "type": "line", "color": "green", "point": { "color": "red" } },
            "transform": [{ "filter": { "selection": "brush" } }]
        }
    ]
}

var occ_rank_chart = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "description": "A bar graph showing the scores of the top 5 students. This shows an example of the window transform, for how the top K (5) can be filtered, and also how a rank can be computed for each student.",
    "data": {
        "name":"wageData"
    },
    "width": 600,
    "transform": [
        {
            "window": [{
                "op": "rank",
                "as": "rank"
            }],
            "sort": [{ "field": "A_MEDIAN_ADJ", "order": "descending" }]
        }, {
            "filter": {
                "and": [
                    "datum.year == '2016'",
                    "datum.rank <= 100"
                ]
            } 
        }
    ],
    "mark": "bar",
    "encoding": {
        "x": {
            "field": "A_MEDIAN_ADJ",
            "type": "quantitative"
        },
        "y": {
            "field": "OCC_TITLE",
            "type": "nominal",
            "sort": { "field": "A_MEDIAN_ADJ", "order": "descending" }
        }
    }
}


function filterOcc(data, state, occupation){

    return data.filter(function(d){
        if (d.ST == state & d.OCC_TITLE == occupation ){
            return true;
        }
        return false;
    });
}

function filterOcc(data, state) {

    return data.filter(function (d) {
        if (d.ST == state ) {
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
    //var state_wage_data = filterOcc(wage_data,st,"Software Developers Applications");
    var state_wage_data = filterOcc(wage_data, st);
    //var state_rpp_data = filterRpp(rpp_data,state);

    // vegaEmbed("#salary", multi_chart_wage)
    //     .then((res) => res.view
    //         .insert("wageData", state_wage_data)
    //     .run()
    // );

    // vegaEmbed("#cpi", multi_chart_rpp)
    //     .then((res) => res.view
    //         .insert("myData", state_wage_data)
    //     .run()
    // );

    vegaEmbed("#salary", occ_rank_chart)
        .then((res) => res.view
            .insert("wageData", state_wage_data)
            .addEventListener('click', function (event, item) {
                console.log(item)
            })
            .run()
        );
}


 d3.select(".state_picker").on("change", function(){
    st = d3.select(this).node().value;
    state = d3.select(this).select("[value='" + st + "']").text();
    updateCharts();
});


  d3.queue()
  //.defer(d3.csv, "/data/rpp_2007_2016.csv")
  .defer(d3.csv, "/data/wages_2007_2016_2.csv")
  .await(analyze);


function analyze(error, wages){
  
    if(error){console.log(error);}

    wage_data = wages;
    updateCharts();
};

  // Embed the visualization in the container with id `vis`
  // vegaEmbed("#vis", vlSpec);

  