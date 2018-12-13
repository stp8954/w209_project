// Chart Rendering/Updating  functions
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
    wages.filter(function (d) { return (d.STATE == state & d.OCC_TITLE == occupation) }).forEach(function (d) {
        occ_year_data.push({ 'STATE': d.STATE, 'YEAR': d.YEAR, 'Wage': d.A_MEDIAN, 'Category': 'Median' });
        occ_year_data.push({ 'STATE': d.STATE, 'YEAR': d.YEAR, 'Wage': d.A_MEDIAN_ADJ, 'Category': 'Adjusted Median' });
    });

    var wage_data = JSON.stringify(occ_year_data);
    var wage_chart = {
        "config": { "view": { "width": 400, "height": 300 } },
        "data": {
            "name": "data-8d84ad15131669f4388700bf91712bde"
        },
        "mark": "bar",
        "encoding": {
            "color": { "type": "nominal", "field": "Category" },
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

function update_wage_comparison_chart() {
    var wage_all = wages.filter(function (d) { return (d.OCC_TITLE == occupation) }).map(function (d) {
        d.A_MEDIAN_ADJ = parseFloat(d.A_MEDIAN_ADJ)
        return d;
    });

    vegaEmbed("#Wage_comparison", wage_comp_chart, { theme: 'fivethirtyeight' })
        .then((res) => {
            v = res.view
                .insert("wage_comp", wage_all)
            v.run();
        }
        );

    document.getElementById("Wage_comparison_header").innerHTML = `<h4>Wage comparison for <mark>${occupation}</mark> across US </h4>`
}