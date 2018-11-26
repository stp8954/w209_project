var OCCAPP = OCCAPP || {};

OCCAPP.state_picker = {};
OCCAPP.state_picker.update_picker = function(st){
}

d3.select(".state_picker").on("change", function(){
    var st = d3.select(this).node().value;
    var state = d3.select(this).select("[value='" + st + "']").text();

    OCCAPP.swapper.set_state(state);
    OCCAPP.swapper.set_st(st);
    OCCAPP.swapper.update_data();
});