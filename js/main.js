
var occ_chart = {
  "$schema": "https://vega.github.io/schema/vega/v3.json",
  "autosize": "pad",
  "padding": { left: 5, right: 5 },
  "width": 1000,
  "height": 800,
  "title": { "text": "States wage growth over the last decade" },
  "style": "cell",
  "data": [
    { "name": "selector035_store" },
    {
      "name": "source_0"
    },
    {
      "name": "data_0",
      "source": "source_0",
      "transform": [
        {
          "type": "filter",
          "expr": "datum[\"A_MEDIAN_ADJ\"] !== null && !isNaN(datum[\"A_MEDIAN_ADJ\"]) && datum[\"YEAR\"] === '2016'"
        }
      ]
    }
  ],
  "signals": [
    {
      "name": "unit",
      "value": {},
      "on": [
        { "events": "mousemove", "update": "isTuple(group()) ? group() : unit" }
      ]
    },
    {
      "name": "selector035",
      "update": "data(\"selector035_store\").length && {STATE: data(\"selector035_store\")[0].values[0]}"
    },
    {
      "name": "selector035_tuple",
      "value": {},
      "on": [
        {
          "events": [{ "source": "scope", "type": "click" }],
          "update": "datum && item().mark.marktype !== 'group' ? {unit: \"\", encodings: [\"y\"], fields: [\"STATE\"], values: [datum[\"STATE\"]]} : null",
          "force": true
        }
      ]
    },
    {
      "name": "selector035_modify",
      "on": [
        {
          "events": { "signal": "selector035_tuple" },
          "update": "modify(\"selector035_store\", selector035_tuple, true)"
        }
      ]
    }
  ],
  "marks": [
    {
      "name": "marks",
      "type": "rect",
      "style": ["bar"],
      "from": { "data": "data_0" },
      "encode": {
        "update": {
          "fill": [
            {
              "test": "!(length(data(\"selector035_store\"))) || (vlSingle(\"selector035_store\", datum))",
              "value": "steelblue"
            },
            { "value": "lightgray" }
          ],
          "x": { "scale": "x", "field": "A_MEDIAN_ADJ" },
          "x2": { "scale": "x", "value": 0 },
          "yc": { "scale": "y", "field": "STATE", "band": 0.5 },
          "height": { "value": 12 }
        }
      }
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "linear",
      "domain": { "data": "data_0", "field": "A_MEDIAN_ADJ" },
      "range": [0, { "signal": "width" }],
      "nice": true,
      "zero": true
    },
    {
      "name": "y",
      "type": "band",
      "domain": {
        "data": "source_0",
        "field": "STATE",
        "sort": { "op": "max", "field": "A_MEDIAN_ADJ", "order": "descending" }
      },
      "range": [0, { "signal": "height" }],
      "paddingInner": 0.1,
      "paddingOuter": 0.05
    }
  ],
  "axes": [
    {
      "scale": "x",
      "orient": "bottom",
      "grid": false,
      "title": "%age wage growth",
      "labelFlush": true,
      "labelOverlap": true,
      "tickCount": { "signal": "ceil(width/40)" },
      "zindex": 1
    },
    {
      "scale": "x",
      "orient": "bottom",
      "grid": true,
      "tickCount": { "signal": "ceil(width/40)" },
      "gridScale": "y",
      "domain": false,
      "labels": false,
      "maxExtent": 0,
      "minExtent": 0,
      "ticks": false,
      "zindex": 0
    },
    {
      "scale": "y",
      "orient": "left",
      "grid": false,
      "title": "States",
      "zindex": 1
    }
  ],
  "config": { "axisY": { "minExtent": 30 } }
};

var wage_chart = {
  "config": { "view": { "width": 400, "height": 300 } },
  "data": {
    "name": "wage_data"
  },
  "mark": "bar",
  "encoding": {
    "color": { "type": "ordinal", "field": "Category" },
    "column": { "type": "nominal", "field": "YEAR" },
    "tooltip": [
      { "type": "nominal", "field": "STATE", "title": "State" },
      { "type": "nominal", "field": "Wage", "title": "Wage" }
    ],
    "x": { "type": "nominal", "axis": { "title": null }, "field": "Category" },
    "y": {
      "type": "quantitative",
      "axis": { "title": "Median Wage in $" },
      "field": "Wage"
    }
  },
  "height": 200,
  "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json"
};

var occ_state_rank = "./data/occ_state_rank.json";


var cpi_delta_chart_vega_lite = "./data/cpi_delta_chart.json";

var wages, delta, st;
var state = 'Washington';
var occupation = 'software developers applications';

set_occupation = function (occ) {
  occupation = occ;
  update_occ_state_rank_chart();
  //update_occ_charts();
};

d3.select(".state_picker").on("change", function () {
  st = d3.select(this).node().value;
  state = d3.select(this).select("[value='" + st + "']").text().trim();
  //update_occ_charts();
  update_texts();
  update_occ_state_rank_chart();
});


//var embed_opt = {"mode": "vega-lite" };
var embed_opt = {
  loader: vegaEmbed.vega.loader({ baseURL: 'https://vega.github.io/vega/' }),
  theme: 'fivethirtyeight', actions: true
}



function update_occ_charts() {
  var v;
  var filtered_occ = wages.filter(function (d) { return (d.OCC_TITLE == occupation) });

  var filtered_state = filtered_occ.filter(function (d) { return (d.STATE == state) });

  vegaEmbed("#occ_chart", occ_chart, { theme: 'fivethirtyeight' })
    .then((res) => {
      v = res.view
        .insert("source_0", filtered_occ)
        //.insert("source_1", filtered_state)
        .addEventListener('click', function (event, item) {
          if (item && item.mark.marktype !== 'group') {
            //console.log(item.datum.STATE)
            filtered_state = filtered_occ.filter(function (d) { return (d.STATE == item.datum.STATE) });
            v.remove('source_1', function (d) { return 1 > 0; }).run();
            v.insert('source_1', filtered_state).run();
          }
        })
      v.run();
    }
    );

};



function get_highest_paid_occ_in_state(state, adjusted) {

  if (adjusted) {
    return wages.filter(function (d) { return (d.STATE == state & d.YEAR == '2016'); })
      .sort(function (a, b) { return d3.descending(parseFloat(a.A_MEDIAN_ADJ), parseFloat(b.A_MEDIAN_ADJ)) })
      .slice(0, 10);
  }
  else {
    return wages.filter(function (d) { return (d.STATE == state & d.YEAR == '2016'); })
      .sort(function (a, b) { return d3.descending(parseFloat(a.A_MEDIAN), parseFloat(b.A_MEDIAN)) })
      .slice(0, 10);
  }
}

function get_lowest_paid_occ_in_state(state, adjusted) {

  if (adjusted) {
    return wages.filter(function (d) { return (d.STATE == state & d.YEAR == '2016'); })
      .sort(function (a, b) { return d3.ascending(parseFloat(a.A_MEDIAN_ADJ), parseFloat(b.A_MEDIAN_ADJ)) })
      .slice(0, 10);
  }
  else {
    return wages.filter(function (d) { return (d.STATE == state & d.YEAR == '2016'); })
      .sort(function (a, b) { return d3.ascending(parseFloat(a.A_MEDIAN), parseFloat(b.A_MEDIAN)) })
      .slice(0, 10);
  }
}

function get_national_avg_for_occ(occupation, adjusted) {
  if (adjusted) {
    return d3.median(wages.filter(function (d) { return (d.OCC_TITLE == occupation & d.YEAR == '2016'); }),
      function (d) { return d.A_MEDIAN_ADJ; });

  }
  else {
    return d3.median(wages.filter(function (d) { return (d.OCC_TITLE == occupation & d.YEAR == '2016'); }),
      function (d) { return d.A_MEDIAN; });

  }
}

function get_wage_state_occ(occupation, state, adjusted) {
  if (adjusted) {
    return wages.filter(function (d) { return (d.STATE == state & d.YEAR == '2016' & d.OCC_TITLE == occupation); })
      .map(function (d) { return d.A_MEDIAN_ADJ });
  }
  else {
    return wages.filter(function (d) { return (d.STATE == state & d.YEAR == '2016' & d.OCC_TITLE == occupation); })
      .map(function (d) { return d.A_MEDIAN });
  }
}

function get_state_rank_for_all_occ(state, adjusted) {

  var map = {};
  for (var occ in occ_map_median) {
    map[occ] = occ_map_median[occ].filter(function (d) { return d.state == state; });
  }
  return map;
}

function get_occ_growth(state) {
  var filtered_wages = wages.filter(function (d) { return (d.STATE == state & (d.YEAR == '2016' | d.YEAR == '2007') & d.OCC_TITLE != 'all occupations'); })

  var occ_rank_map = {};
  var rank = 0;
  d3.nest()
    .key(d => d.OCC_TITLE)
    .entries(filtered_wages)
    .filter(d => d.values.length == 2)
    .map(function (d) {
      var w_2007 = parseFloat(d.values.filter(d => d.YEAR == '2007').map(d => d.A_MEDIAN_ADJ)[0]);
      var w_2016 = parseFloat(d.values.filter(d => d.YEAR == '2016').map(d => d.A_MEDIAN_ADJ)[0]);
      return { 'occ': d.key, 'delta': (w_2016 - w_2007) / w_2007 * 100, 'w_2007': w_2007, 'w_2016': w_2016 };
    }).sort(function (a, b) { return d3.descending(a.delta, b.delta) })
    .forEach(function (d) {
      rank++;
      occ_rank_map[rank] = d;
    });

  return occ_rank_map;
}

var occ_map_median = {}
var occ_map_median_adj = {}

function generate_occ_to_state_rank_mapping() {
  var filtered_wages = wages.filter(function (d) { return (d.YEAR == '2016' & d.OCC_TITLE != 'all occupations'); });
  var rank = 0;
  d3.nest()
    .key(d => d.OCC_TITLE)
    .entries(filtered_wages)
    .forEach(function (d) {
      //console.log(d);
      rank = 0;
      occ_map_median[d.key] = d.values.sort(function (a, b) {
        return d3.descending(parseFloat(a.A_MEDIAN), parseFloat(b.A_MEDIAN))
      })
        .map(d => {
          rank++;
          return { "state": d.STATE, "median": d.A_MEDIAN, "median_adj": d.A_MEDIAN_ADJ, "rank": rank }
        }
        );
    });

  d3.nest()
    .key(d => d.OCC_TITLE)
    .entries(filtered_wages)
    .forEach(function (d) {
      //console.log(d);
      rank = 0;
      occ_map_median_adj[d.key] = d.values.sort(function (a, b) {
        return d3.descending(parseFloat(a.A_MEDIAN_ADJ), parseFloat(b.A_MEDIAN_ADJ))
      })
        .map(d => {
          rank++;
          return { "state": d.STATE, "median": d.A_MEDIAN, "median_adj": d.A_MEDIAN_ADJ, "rank": rank }
        }
        );
    });
}

//https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
function formatMoney(n, c, d, t) {
  var c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;

  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function get_yearly_wage_text(occupation, state) {

  var state_median = get_wage_state_occ(occupation, state, false);
  var state_median_adj = get_wage_state_occ(occupation, state, true);

  var national_median = get_national_avg_for_occ(occupation, false);
  var national_median_adj = get_national_avg_for_occ(occupation, true);

  var diff = (national_median > state_median ? (national_median - state_median) : (state_median - national_median));
  var quant = national_median > state_median ? 'below' : 'above';

  state_median = formatMoney(state_median)
  state_median_adj = formatMoney(state_median_adj)
  national_median = formatMoney(national_median)
  diff = formatMoney(diff)

  var occ_year_data = [];
  wages.filter(function(d){ return (d.STATE ==state & d.OCC_TITLE == occupation)}).forEach(function (d) {
      occ_year_data.push({'STATE':d.STATE, 'YEAR':d.YEAR, 'Wage':d.A_MEDIAN , 'Category':'Median'});
      occ_year_data.push({'STATE':d.STATE, 'YEAR':d.YEAR, 'Wage':d.A_MEDIAN_ADJ , 'Category':'Adjusted Median'});
  });

  var wage_data = JSON.stringify(occ_year_data);
  var wage_chart = {
    "config": {"view": {"width": 400, "height": 300}},
    "data": {
      "name": "data-8d84ad15131669f4388700bf91712bde"
    },
    "mark": "bar",
    "encoding": {
      "color": {"type": "nominal", "field": "Category"},
      "column": {"type": "nominal", "field": "YEAR"},
      "tooltip": [
        {"type": "nominal", "field": "STATE", "title": "State"},
        {"type": "nominal", "field": "Wage", "title": "Wage"}
      ],
      "x": {"type": "nominal", "axis": {"title": null}, "field": "Category"},
      "y": {
        "type": "quantitative",
        "axis": {"title": "Median Wage in $"},
        "field": "Wage"
      }
    },
    "height": 200,
    "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
    "datasets": {
      "data-8d84ad15131669f4388700bf91712bde": wage_data
    }
  };
  var v;
  vegaEmbed("#yearly_wage_graph", wage_chart, { theme: 'fivethirtyeight' })
    .then((res) => {
      v = res.view;
      v.run();
    }
    );
  
  document.getElementById("yearWageTag").innerHTML = `Yearly Wages for ${state}`;
  var yearly_wage = `In 2016, people working in <mark>${occupation}</mark> in <mark>${state}</mark> state earned an average of <mark>$${state_median}</mark> , <mark>$${diff}</mark> ${quant} than the average national salary of <mark>$${national_median}</mark> .
  However when adjusted for cost of living the state median salary for <mark>${occupation}</mark> changes to <mark>$${state_median_adj}</mark>. The chart to the left shows the trend in Median wage and Wage adjusted for cost of living from 2007 to 2016. `

  return yearly_wage;
}

function get_best_paid_jobs(state) {


  var occ_rank = get_state_rank_for_all_occ(state, false);
  var occ_rank_adj = get_state_rank_for_all_occ(state, true);

  var high_occ = get_highest_paid_occ_in_state(state, false);

  var num_high_rank = 0;
  var num_high_rank_adj = 0;
  for (var occ in occ_rank) {
    if (occ_rank[occ].length > 0 && occ_rank[occ][0].rank == 1) {
      num_high_rank++;
    }
    if (occ_rank_adj[occ].length > 0 && occ_rank_adj[occ][0].rank == 1) {
      num_high_rank_adj++;
    }
  }

  var num_occ_pct = Math.round(num_high_rank / 838 * 100);

  var filtered_occ = wages.filter(function (d) {
    return (d.STATE == state & (d.OCC_TITLE == high_occ[0].OCC_TITLE |
      d.OCC_TITLE == high_occ[1].OCC_TITLE |
      d.OCC_TITLE == high_occ[2].OCC_TITLE))
  }).map(function (d) {
    d.A_MEDIAN_ADJ = parseFloat(d.A_MEDIAN_ADJ)
    d.A_MEDIAN = parseFloat(d.A_MEDIAN)
    return d;
  });

  var mydata = JSON.stringify(filtered_occ);
  var best_wage_chart2 = {
    "config": { "view": { "width": 400, "height": 300 } },
    "data": { "name": "data-8d84ad15131669f4388700bf91712bde" },
    "mark": "bar",
    "encoding": {
      "color": { "type": "nominal", "field": "OCC_TITLE" },
      "column": { "type": "nominal", "field": "YEAR" },
      "tooltip": [
        { "type": "nominal", "field": "OCC_TITLE", "title": "Occupation" },
        { "type": "nominal", "field": "A_MEDIAN", "title": "Median Wage" },
        { "type": "nominal", "field": "A_MEDIAN_ADJ", "title": "Adj Median Wage" }
      ],
      "x": { "type": "nominal", "axis": { "title": null }, "field": "OCC_TITLE" },
      "y": {
        "type": "quantitative",
        "axis": { "title": "Median Wage in $" },
        "field": "A_MEDIAN_ADJ"
      }
    },
    "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
    "datasets": {
      "data-8d84ad15131669f4388700bf91712bde": mydata
    }
  };
  var v;
  vegaEmbed("#best_wage_graph", best_wage_chart2, { theme: 'fivethirtyeight' })
    .then((res) => {
      v = res.view;
      v.run();
    }
    );
    
  document.getElementById("BestPaidTag").innerHTML = `Best paid jobs in ${state}`;
  var text = `<mark>${state}'s</mark> highest paid jobs include <mark>${high_occ[0].OCC_TITLE}</mark>, <mark>${high_occ[1].OCC_TITLE}</mark>, and <mark>${high_occ[2].OCC_TITLE}</mark>.

  About <mark>${num_high_rank}</mark> occupations in <mark>${state}</mark> have the highest median annual pay compared to the other states in the country out of 838 specific occupations, that's <mark>${num_occ_pct}%</mark> of all jobs with the highest pay categorized by the Bureau of Labor Statistics. 
  After adjusting for the actual value of a dollar in a given state, <mark>${state}</mark> has about <mark>${num_high_rank_adj}</mark> jobs that have the highest median annual salary compared to other states.`;

  return text;
}

function get_worst_paid_jobs(state) {
  var low_occ = get_lowest_paid_occ_in_state(state, true);
  var occ_growth = get_occ_growth(state);

  var len = Object.keys(occ_growth).length

  var filtered_occ = wages.filter(function (d) {
    return (d.STATE == state & (d.OCC_TITLE == low_occ[0].OCC_TITLE |
      d.OCC_TITLE == low_occ[1].OCC_TITLE |
      d.OCC_TITLE == low_occ[2].OCC_TITLE))
  }).map(function (d) {
    d.A_MEDIAN_ADJ = parseFloat(d.A_MEDIAN_ADJ)
    d.A_MEDIAN = parseFloat(d.A_MEDIAN)
    return d;
  });

  var mydata = JSON.stringify(filtered_occ);
  var worst_wage_chart2 = {
    "config": { "view": { "width": 400, "height": 300 } },
    "data": { "name": "data-8d84ad15131669f4388700bf91712bde" },
    "mark": "bar",
    "encoding": {
      "color": { "type": "nominal", "field": "OCC_TITLE" },
      "column": { "type": "nominal", "field": "YEAR" },
      "tooltip": [
        { "type": "nominal", "field": "OCC_TITLE", "title": "Occupation" },
        { "type": "nominal", "field": "A_MEDIAN", "title": "Median Wage" },
        { "type": "nominal", "field": "A_MEDIAN_ADJ", "title": "Adj Median Wage" }
      ],
      "x": { "type": "nominal", "axis": { "title": null }, "field": "OCC_TITLE" },
      "y": {
        "type": "quantitative",
        "axis": { "title": "Median Wage in $" },
        "field": "A_MEDIAN_ADJ"
      }
    },
    "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
    "datasets": {
      "data-8d84ad15131669f4388700bf91712bde": mydata
    }
  };
  var v;
  vegaEmbed("#worst_wage_graph", worst_wage_chart2, { theme: 'fivethirtyeight' })
    .then((res) => {
      v = res.view;
      v.run();
    }
    );

    document.getElementById("WorstPaidTag").innerHTML = `Worst paid jobs in ${state}`;
  var text = `<mark>${state}'s</mark>  lowest-paying jobs include <mark>${low_occ[0].OCC_TITLE}</mark>, <mark>${low_occ[1].OCC_TITLE}</mark>, and <mark>${low_occ[2].OCC_TITLE}</mark>. After adjusting for cost of living, those occupational groups make <mark>$${formatMoney(low_occ[0].A_MEDIAN_ADJ)}</mark>, <mark>$${formatMoney(low_occ[1].A_MEDIAN_ADJ)}</mark>, and <mark>$${formatMoney(low_occ[2].A_MEDIAN_ADJ)}</mark> respectively.

  <mark>${occ_growth[len].occ}</mark> have seen the largest decline in wages. Between 2007 and 2016, the adjusted median annual salary dropped from <mark>$${formatMoney(occ_growth[len].w_2007)}</mark> to <mark>$${formatMoney(occ_growth[len].w_2016)}</mark>. That's a change of about <mark>${Math.round(occ_growth[len].delta)}%</mark>.
  
  Meanwhile, <mark>${occ_growth[1].occ}</mark> saw the sharpest increase in wages in <mark>${state}</mark>. Income went up <mark>${Math.round(occ_growth[1].delta)}%</mark> between 2007 and 2016 from <mark>$${formatMoney(occ_growth[1].w_2007)}</mark> to <mark>$${formatMoney(occ_growth[1].w_2016)}</mark>.`

  return text;
}

function update_cpi_delta_chart() {
  var v;
  var filtered_cpi = delta.filter(function (d) { return (d.OCC_TITLE == 'all occupations') });
  var filtered_wage = wages.filter(function (d) { return (d.OCC_TITLE == 'all occupations' && d.YEAR == '2016') }).map(function (d) {
    d.CPI = parseFloat(d.CPI)
    return d;
  });

  vegaEmbed("#cpi_delta", cpi_delta_chart_vega_lite, { theme: 'fivethirtyeight' })
    .then((res) => {
      v = res.view
        .insert("cpi_delta", filtered_cpi)
        .insert("cpi_2016", filtered_wage);
      v.run();
    }
    );
}

function update_occ_state_rank_chart() {
  var temp_chart = `{
    "config": {"view": {"width": 400, "height": 300}},
    "padding": {"left":30, "right":30, "bottom":10, "top":20},
    "data": {
      "name":"occ_rank"
    },
    "mark": "bar",
    "encoding": {
      "color": {
        "condition": {
          "value": "orange",
          "test": "(datum.STATE === '${state}')"
        },
        "value": "steelblue"
      },
      "tooltip": [
        {"type": "nominal", "field": "STATE", "title": "State"},
        {"type": "nominal", "field": "A_MEDIAN", "title": "Median Wage"},
        {"type": "nominal", "field": "A_MEDIAN_ADJ", "title": "Adj Median Wage"}
      ],
      "x": {
        "type": "nominal",
        "axis": {"labelAngle": -45, "title": "States"},
        "field": "STATE",
        "sort": {"op": "max", "field": "A_MEDIAN_ADJ", "order": "descending"}
      },
      "y": {
        "type": "quantitative",
        "axis": {"title": "Wage adjusted for inflation in $"},
        "field": "A_MEDIAN_ADJ"
      }
    },
    "selection": {
      "selector029": {
        "type": "single",
        "encodings": ["y"],
        "on": "mouseover",
        "empty": "all",
        "resolve": "global"
      }
    },
    "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json"
  }`;

  temp_chart = JSON.parse(temp_chart);
  var v;
  var filtered_occ = wages.filter(function (d) { return (d.OCC_TITLE == occupation & d.YEAR == '2016') }).map(function (d) {
    d.A_MEDIAN_ADJ = parseFloat(d.A_MEDIAN_ADJ)
    return d;
  });
  ;
  vegaEmbed("#occ_chart", temp_chart, { theme: 'fivethirtyeight' })
    .then((res) => {
      v = res.view
        .insert("occ_rank", filtered_occ)
      v.run();
    }
    );

  document.getElementById("occ_title").innerHTML = `<h4> State ranked by adjusted wage for <mark>${occupation}</mark> occupation</h4>`
}

function update_texts() {
  document.getElementById("yearly_wage_text").innerHTML = get_yearly_wage_text(occupation, state);
  document.getElementById("best_wage_text").innerHTML = get_best_paid_jobs(state);
  document.getElementById("worst_wage_text").innerHTML = get_worst_paid_jobs(state);
}

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



  wages = d3.merge([wages_data1, wages_data2, wages_data3, wages_data4,
    wages_data5, wages_data6, wages_data7, wages_data8,
    wages_data9, wages_data10]);
  delta = delta_data.map(function (d) {
    d.cpi_delta = parseFloat(d.cpi_delta)
    return d;
  });
  generate_occ_to_state_rank_mapping();


  update_cpi_delta_chart();
  update_occ_state_rank_chart();
  update_texts();
  //updateCharts();
  //update_occ_charts();
};