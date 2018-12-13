
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