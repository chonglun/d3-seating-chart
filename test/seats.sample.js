function genControl(x, y, w, h, name){
    var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    rect.setAttribute("zoom-control", name);
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", w);
    rect.setAttribute("height", h);
    return rect;
}
function genRowCounter(x, y, content){
    var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("text-anchor", "middle");
    text.textContent = content;
    return text;
}

function genSeats(x, y, w, h, name){
    var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    g.setAttribute("seating-area", name);
    g.setAttribute("zoom-target", name);
    var r = 5;
    var mw = 2;
    var mh = 5;
    var startx = x+mw*5;
    var starty = y+mh*3;
    var circlex = startx;
    var circley = starty;
    var lastx = circlex;
    var counter = 0;
    while(circley<(h+starty-mh*5)) {
        lastx = circlex
        var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.setAttribute("cx", circlex);
        circle.setAttribute("cy", circley);
        circle.setAttribute("r", r);
        circle.setAttribute("seat", counter);
        g.appendChild(circle);

        // var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        // text.setAttribute("x", circlex);
        // text.setAttribute("y", circley);
        // text.setAttribute("alignment-baseline", "middle");
        // text.setAttribute("text-anchor", "middle");
        // text.textContent = counter;
        // g.appendChild(text);

        circlex = startx + (circlex + r*2 + mw - startx) % (w-r);
        if (circlex < lastx){
            circlex = startx;
            circley = circley + r*2 + mh;
        }
        ++counter;
    };
    return g;
}
function genSeatsWithText(x, y, w, h, name){
    var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    g.setAttribute("seating-area", name);
    g.setAttribute("zoom-target", name);
    var r = 5;
    var mw = 2;
    var mh = 5;
    var startx = x+mw*5;
    var starty = y+mh*3;
    var circlex = startx;
    var circley = starty;
    var lastx = circlex;
    var counter = 0;
    var row = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    var rcounter = 0;
    var firstseat = true;
    while(circley<(h+starty-mh*5)) {
        lastx = circlex
        if (firstseat){
            // row.appendChild(genRowCounter(circlex,circley,rcounter));
            firstseat = false;
        }else{
            var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute("cx", circlex);
            circle.setAttribute("cy", circley);
            circle.setAttribute("r", r);
            circle.setAttribute("seat", counter);
            row.appendChild(circle);
        }

        // var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        // text.setAttribute("x", circlex);
        // text.setAttribute("y", circley);
        // text.setAttribute("alignment-baseline", "middle");
        // text.setAttribute("text-anchor", "middle");
        // text.textContent = counter;
        // g.appendChild(text);

        circlex = startx + (circlex + r*2 + mw - startx) % (w-r);
        if (circlex < lastx){
            circlex = startx;
            circley = circley + r*2 + mh;
            g.appendChild(row);
            ++rcounter;
            row = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            firstseat = true;
        }
        ++counter;
    };
    return g;
}
function ShowSVG(w, h){
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("id", "x");
    var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    g.setAttribute("board", "");
    w_margin = 40
    h_margin = 40
    w_region = 200
    h_region = 300
    x_region = 0
    y_region = 0
    while (y_region < h){
        while(x_region < w){
            name = "g_"+x_region+"_"+y_region;
            g.appendChild(genControl(x_region, y_region, w_region, h_region, name));
            g.appendChild(genSeats(x_region, y_region, w_region, h_region, name));
            x_region = x_region + w_region + w_margin;
        }
        y_region = y_region+h_region+h_margin;
        x_region = 0;
    }
    svg.appendChild(g);
    document.body.appendChild(svg);
}