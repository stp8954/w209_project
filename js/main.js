
var occ_chart = "./data/occ_chart.json";
var occ_state_rank = "./data/occ_state_rank.json";
var cpi_delta_chart_vega_lite = "./data/cpi_delta_chart.json";
var wage_comp_chart = "./data/wage_comp.json";

// Global variables
var wages, delta, st;
var occ_map_median = {}
var occ_map_median_adj = {}

// Variables holding current STATE and OCCUPATION selection
var state = 'Washington';
var occupation = 'software developers applications';

// STATE and OCCUPATION change event handlers
set_occupation = function (occ) {
  occupation = occ;
  update_occ_state_rank_chart();
  update_wage_comparison_chart();
};

d3.select(".state_picker").on("change", function () {
  st = d3.select(this).node().value;
  state = d3.select(this).select("[value='" + st + "']").text().trim();
  update_texts();
  update_occ_state_rank_chart();
});

function update_texts() {
  document.getElementById("yearly_wage_text").innerHTML = get_yearly_wage_text(occupation, state);
  document.getElementById("best_wage_text").innerHTML = get_best_paid_jobs(state);
  document.getElementById("worst_wage_text").innerHTML = get_worst_paid_jobs(state);
}

// using d3.defer to load chunks of data in parallel
d3.queue()
  .defer(d3.csv, "./data/wages_2007_2016_1.csv")
  .defer(d3.csv, "./data/wages_2007_2016_2.csv")
  .defer(d3.csv, "./data/wages_2007_2016_3.csv")
  .defer(d3.csv, "./data/wages_2007_2016_4.csv")
  .defer(d3.csv, "./data/wages_2007_2016_5.csv")
  .defer(d3.csv, "./data/wages_2007_2016_6.csv")
  .defer(d3.csv, "./data/wages_2007_2016_7.csv")
  .defer(d3.csv, "./data/wages_2007_2016_8.csv")
  .defer(d3.csv, "./data/wages_2007_2016_9.csv")
  .defer(d3.csv, "./data/wages_2007_2016_10.csv")
  .defer(d3.csv, "./data/wages_delta.csv")
  .await(analyze);

function analyze(error, wages_data1,
  wages_data2, wages_data3, wages_data4,
  wages_data5, wages_data6, wages_data7,
  wages_data8, wages_data9, wages_data10, delta_data) {

  if (error) { console.log(error); }

  // merging different chunks of data into a single array
  wages = d3.merge([wages_data1, wages_data2, wages_data3, wages_data4,
    wages_data5, wages_data6, wages_data7, wages_data8,
    wages_data9, wages_data10]);
  delta = delta_data.map(function (d) {
    d.cpi_delta = parseFloat(d.cpi_delta)
    return d;
  });

  generate_occ_to_state_rank_mapping();
  //update charts and text with default state and occupation
  update_cpi_delta_chart();
  update_occ_state_rank_chart();
  update_texts();
  update_wage_comparison_chart();
};