webpackJsonp([0,1],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __webpack_require__(4);
const style_inline_1 = __webpack_require__(5);
const showBehavior_enum_1 = __webpack_require__(2);
const selectionChangeEvent_model_1 = __webpack_require__(6);
const D3SeatingChartDefaultConfig = {
    showBehavior: showBehavior_enum_1.ShowBehavior.DirectDecendants,
    allowManualSelection: true
};
class D3SeatingChart {
    constructor(element) {
        this.element = element;
        this.margin = 20;
        this.history = [];
        this.zoomChangedListeners = [];
        this.selectionChangeListeners = [];
        this.selectedElements = [];
    }
    init(config) {
        let svgSelection = d3.select(this.element);
        let gSelection = svgSelection.select('g');
        this.config = config;
        this.uniqueIdentifier = `d3sc_${Math.round(Math.random() * 10000000000)}`;
        this.element.setAttribute(this.uniqueIdentifier, '');
        let style = document.createElement('style');
        style.innerHTML = style_inline_1.InlineStyle.replace(/\{@uid\}/g, this.uniqueIdentifier);
        this.element.appendChild(style);
        this.bindEvents();
        this.zoom(gSelection, false);
    }
    stripStyles(selector) {
        let svgSelection = d3.select(this.element);
        svgSelection.selectAll(selector)
            .attr('stroke', null)
            .attr('stroke-width', null)
            .attr('fill', null);
    }
    getBoard() {
        return this.selectElement('[board]');
    }
    selectElement(query) {
        return d3.select(this.element).select(query);
    }
    selectElements(query) {
        return d3.select(this.element).selectAll(query);
    }
    goToBoard() {
        this.zoom(this.getBoard());
    }
    clearHistory() {
        this.history.length = 0;
    }
    canGoBack() {
        return !!this.history.length;
    }
    goBack() {
        this.history.pop();
        if (this.history.length) {
            this.zoom(this.history[this.history.length - 1]);
        }
        else {
            this.goToBoard();
        }
    }
    registerZoomChangeListener(fn) {
        this.zoomChangedListeners.push(fn);
        return () => {
            let idx = this.zoomChangedListeners.indexOf(fn);
            if (idx != -1) {
                this.zoomChangedListeners.splice(idx, 1);
            }
        };
    }
    registerSelectionChangeListener(fn) {
        this.selectionChangeListeners.push(fn);
        return () => {
            let idx = this.selectionChangeListeners.indexOf(fn);
            if (idx != -1) {
                this.selectionChangeListeners.splice(idx, 1);
            }
        };
    }
    zoom(selection, animate = true) {
        let scaleTransform;
        let translateTransform;
        let boardSelection = this.getBoard();
        let boundingBox = selection.node().getBBox();
        if (selection.node() !== boardSelection.node()) {
            if (selection != this.focusedElement) {
                this.history.push(selection);
            }
        }
        else {
            this.clearHistory();
        }
        this.selectElements('.focused').classed('focused', false);
        selection.classed('focused', true);
        this.focusedElement = selection;
        let all = boardSelection.selectAll(`*`);
        let activeLayer = selection.selectAll('.focused > *');
        let parentWidth = this.element.clientWidth;
        let parentHeight = this.element.clientHeight;
        let desiredWidth = parentWidth - this.margin * 2;
        let desiredHeight = parentHeight - this.margin * 2;
        let widthRatio = desiredWidth / boundingBox.width;
        let heightRatio = desiredHeight / boundingBox.height;
        let ratio = Math.min(widthRatio, heightRatio);
        scaleTransform = `scale(${ratio})`;
        let newX = (this.element.clientWidth / 2 - boundingBox.width * ratio / 2 - boundingBox.x * ratio);
        let newY = (this.element.clientHeight / 2 - boundingBox.height * ratio / 2 - boundingBox.y * ratio);
        translateTransform = `translate(${newX},${newY})`;
        let currentTransform = selection.attr('transform');
        if (!currentTransform) {
            currentTransform = 'translate(0, 0)scale(1)';
        }
        if (this.config.showBehavior !== showBehavior_enum_1.ShowBehavior.All) {
            // let hideList = this.getHideList(selection);
            // let showList = this.getShowList(selection);
            // hideList
            //     .style('opacity', 1)
            //     .transition()
            //     .duration(animate ? 300 : 0)
            //     .style('opacity', 0);
            // showList.transition()
            //     .style('opacity', 0)
            //     .duration(animate ? 300 : 0)
            //     .style('opacity', 1);
        }
        boardSelection.transition()
            .duration(animate ? 300 : 0)
            .attr('transform', `${translateTransform}${scaleTransform}`);
        let tmpListeners = this.zoomChangedListeners.concat([]);
        tmpListeners.forEach((listener) => {
            listener();
        });
    }
    getShowList(selection) {
        if (this.config.showBehavior === showBehavior_enum_1.ShowBehavior.AllDecendants) {
            return selection.selectAll('.focused *');
        }
        else {
            return selection.selectAll('.focused > *');
        }
    }
    getHideList(selection) {
        let boardSelection = this.getBoard();
        let all = boardSelection.selectAll(`*`);
        let children;
        if (this.config.showBehavior === showBehavior_enum_1.ShowBehavior.AllDecendants) {
            children = selection.selectAll('.focused *');
        }
        else {
            children = selection.selectAll('.focused > *');
        }
        return d3.selectAll(all.nodes().filter((a) => {
            return a != boardSelection.node() && a != selection.node() && children.nodes().indexOf(a) == -1 && (a.style.opacity === '' || a.style.opacity === '1');
        }));
    }
    refresh() {
        this.zoom(this.focusedElement, false);
    }
    bindEvents() {
        let self = this;
        this.selectElements('[zoom-control]').on('click', (d) => {
            let ele = d3.event.srcElement;
            let expose = ele.getAttribute('zoom-control');
            if (expose) {
                this.zoom(this.selectElement(`[zoom-target="${expose}"]`));
            }
        });
        if (this.config.allowManualSelection) {
            this.selectElements('[seat]').on('click', function () {
                let selectionsChanged = false;
                let ele = this;
                if (!ele.hasAttribute('locked')) {
                    selectionsChanged = true;
                    if (ele.hasAttribute('selected')) {
                        self.selectedElements.splice(self.selectedElements.findIndex(x => x === ele), 1);
                        ele.removeAttribute('selected');
                    }
                    else {
                        self.selectedElements.push(ele);
                        ele.setAttribute('selected', '');
                    }
                }
                if (selectionsChanged) {
                    self.emitSelectionChangeEvent(selectionChangeEvent_model_1.SelectionChangeEventReason.SelectionChanged);
                }
            });
        }
    }
    lock(ele, c = '', emitEvents = true) {
        let selectionChanges = false;
        ele = this.resolveElements(ele);
        ele.forEach((e) => {
            if (!e.hasAttribute('locked') || e.getAttribute('locked') != c) {
                e.setAttribute('locked', c);
                if (e.hasAttribute('selected')) {
                    e.removeAttribute('selected');
                    selectionChanges = true;
                }
            }
        });
        if (emitEvents && selectionChanges) {
            this.emitSelectionChangeEvent(selectionChangeEvent_model_1.SelectionChangeEventReason.LockOverride);
        }
    }
    unlockAll(c = '') {
        if (c) {
            this.unlock(`[locked="${c}"]`);
        }
        else {
            this.unlock('[locked]');
        }
    }
    unlock(ele) {
        ele = this.resolveElements(ele);
        ele.forEach((e) => {
            if (e.hasAttribute('locked')) {
                e.removeAttribute('locked');
            }
        });
    }
    deselectAll(emitEvents = true) {
        this.deselect('[selected]', emitEvents);
    }
    deselect(ele, emitEvents = true) {
        let selectionChanges = false;
        ele = this.resolveElements(ele);
        ele.forEach((e) => {
            if (e.hasAttribute('selected')) {
                selectionChanges = true;
                e.removeAttribute('selected');
            }
        });
        if (emitEvents && selectionChanges) {
            this.emitSelectionChangeEvent(selectionChangeEvent_model_1.SelectionChangeEventReason.SelectionChanged);
        }
    }
    select(ele, emitEvents = true) {
        let selectionChanges = false;
        ele = this.resolveElements(ele);
        ele.forEach((e) => {
            if (!e.hasAttribute('locked')) {
                if (!e.hasAttribute('selected')) {
                    selectionChanges = true;
                    e.setAttribute('selected', '');
                }
            }
            else {
                throw new Error('Unable to select element because its locked ' + e.outerHTML);
            }
        });
        if (emitEvents && selectionChanges) {
            this.emitSelectionChangeEvent(selectionChangeEvent_model_1.SelectionChangeEventReason.SelectionChanged);
        }
    }
    getClosestSeats(seatingAreaName, numSeats, contiguous = true, scatterFallback = true) {
        let stage = this.selectElement('[stage]');
        let seatingArea = this.selectElement(`[seating-area="${seatingAreaName}"]`);
        let seats = seatingArea.selectAll('[seat]').nodes();
        let stageBBox = stage.node().getBBox();
        let seatingAreaBBox = seatingArea.node().getBBox();
        let stageCenterX = stageBBox.x + stageBBox.width / 2;
        let stageCenterY = stageBBox.y + stageBBox.height / 2;
        let seatingAreaCenterX = seatingAreaBBox.x + seatingAreaBBox.width / 2;
        let seatingAreaCenterY = seatingAreaBBox.y + seatingAreaBBox.height / 2;
        let slopeX = seatingAreaCenterX - stageCenterX;
        let slopeY = seatingAreaCenterY - stageCenterY;
        let direction;
        if (Math.abs(slopeX) > Math.abs(slopeY)) {
            direction = slopeX < 0 ? 4 : 2;
        }
        else {
            direction = slopeY < 0 ? 1 : 3;
        }
        let sortedSeats = seats.sort((a, b) => {
            let aX = Math.round(parseFloat(a.getAttribute('x')));
            let aY = Math.round(parseFloat(a.getAttribute('y')));
            let bX = Math.round(parseFloat(b.getAttribute('x')));
            let bY = Math.round(parseFloat(b.getAttribute('y')));
            switch (direction) {
                case 1:
                    if (aY < bY) {
                        return 1;
                    }
                    else if (aY > bY) {
                        return -1;
                    }
                    else {
                        if (aX < bX) {
                            return 1;
                        }
                        else if (aX > bX) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
                case 2:
                    if (aX > bX) {
                        return 1;
                    }
                    else if (aX < bX) {
                        return -1;
                    }
                    else {
                        if (aY > bY) {
                            return 1;
                        }
                        else if (aY < bY) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
                case 3:
                    if (aY > bY) {
                        return 1;
                    }
                    else if (aY < bY) {
                        return -1;
                    }
                    else {
                        if (aX < bX) {
                            return 1;
                        }
                        else if (aX > bX) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
                case 4:
                    if (aX < bX) {
                        return 1;
                    }
                    else if (aX > bX) {
                        return -1;
                    }
                    else {
                        if (aY > bY) {
                            return 1;
                        }
                        else if (aY < bY) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
            }
        });
        if (contiguous) {
            let sections = [];
            let sortedSeatsCopy = sortedSeats.concat([]);
            let j = 0;
            do {
                j++;
                let br = -1;
                let lastSeat;
                for (let i = 0; i < sortedSeatsCopy.length; i++) {
                    let seat = sortedSeatsCopy[i];
                    if (seat.hasAttribute('locked')) {
                        br = i;
                        sortedSeatsCopy.splice(i, 1);
                        break;
                    }
                    else if (lastSeat) {
                        if (direction === 1 || direction === 3) {
                            let lsY = Math.round(parseFloat(lastSeat.getAttribute('y')));
                            let sY = Math.round(parseFloat(seat.getAttribute('y')));
                            if (lsY != sY) {
                                br = i;
                                break;
                            }
                        }
                        else {
                            let lsX = Math.round(parseFloat(lastSeat.getAttribute('x')));
                            let sX = Math.round(parseFloat(seat.getAttribute('x')));
                            if (lsX != sX) {
                                br = i;
                                break;
                            }
                        }
                    }
                    lastSeat = seat;
                }
                if (br == -1) {
                    sections.push(sortedSeatsCopy.splice(0, sortedSeatsCopy.length));
                }
                else {
                    sections.push(sortedSeatsCopy.splice(0, br));
                }
            } while (sortedSeatsCopy.length && j < 20);
            for (let i = 0; i < sections.length; i++) {
                let section = sections[i];
                if (section.length >= numSeats) {
                    return section.splice(0, numSeats);
                }
            }
        }
        if (!contiguous || scatterFallback) {
            return sortedSeats.filter(x => !x.hasAttribute('locked')).splice(0, numSeats);
        }
        return [];
    }
    emitSelectionChangeEvent(r) {
        let tmpListeners = this.selectionChangeListeners.concat([]);
        tmpListeners.forEach((listener) => {
            listener({
                reason: r,
                selection: this.selectedElements.concat([])
            });
        });
    }
    resolveElements(ele) {
        if (typeof (ele) === 'string') {
            ele = this.selectElements(ele).nodes();
        }
        else if (!(ele instanceof Array)) {
            ele = [ele];
        }
        return ele;
    }
    static attach(element, config = D3SeatingChartDefaultConfig) {
        let d3s = new D3SeatingChart(element);
        d3s.init(config);
        return d3s;
    }
}
exports.D3SeatingChart = D3SeatingChart;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const D3SeatingChart_1 = __webpack_require__(0);
const showBehavior_enum_1 = __webpack_require__(2);
if (document.getElementById('x')){

}else{
    ShowSVG(1200,700);
}
let d3sc = D3SeatingChart_1.D3SeatingChart.attach(document.getElementById('x'), {
    showBehavior: showBehavior_enum_1.ShowBehavior.AllDecendants,
    allowManualSelection: true
});
var unreg = d3sc.registerZoomChangeListener(() => {
    console.log('zoom evt should run once');
    unreg();
});
d3sc.registerZoomChangeListener(() => {
    console.log('zoom evt should run everytime');
});
var unreg2 = d3sc.registerSelectionChangeListener((e) => {
    console.log('select evt should run once');
    console.log(e);
    unreg2();
});
d3sc.registerSelectionChangeListener((e) => {
    console.log(e);
    console.log('select evt should run everytime');
});
if (document.getElementById('x')){
    document.getElementById('x').ondblclick = function () {
        if (d3sc.canGoBack()) {
            d3sc.goBack();
        }
        else {
            console.log('you cant go back');
        }
    };
}
if (document.getElementById('goToBoard')){
    document.getElementById('goToBoard').onclick = function () {
        d3sc.goToBoard();
    };
}
if (document.getElementById('refresh')){
    document.getElementById('refresh').onclick = function () {
        d3sc.refresh();
    };
}

if (document.getElementById('refresh')){
    document.getElementById('goBack').onclick = function () {
        if (d3sc.canGoBack()) {
            d3sc.goBack();
        }
        else {
            console.log('you cant go back');
        }
    };
}

if (document.getElementById('lock')){
    document.getElementById('lock').onclick = function () {
        d3sc.lock('[seat="5"]');
    };
}
if (document.getElementById('unlock')){
    document.getElementById('unlock').onclick = function () {
        d3sc.unlock('[seat="5"]');
    };
}
if (document.getElementById('select')){ 
    document.getElementById('select').onclick = function () {
        d3sc.select('[seat="5"]');
    };
}
if (document.getElementById('deselect')){ 
    document.getElementById('deselect').onclick = function () {
        d3sc.deselect('[seat="5"]');
    };
}
if (document.getElementById('reserve')){  
    document.getElementById('reserve').onclick = function () {
        d3sc.lock('[seat="5"]', 'reserved');
    };
}
if (document.getElementById('unreserve')){   
    document.getElementById('unreserve').onclick = function () {
        d3sc.unlock('[seat="5"]');
    };
}
if (document.getElementById('closest1')){       
    document.getElementById('closest1').onclick = function () {
        d3sc.select(d3sc.getClosestSeats('left', 3, false));
    };
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ShowBehavior;
(function (ShowBehavior) {
    ShowBehavior[ShowBehavior["All"] = 1] = "All";
    ShowBehavior[ShowBehavior["DirectDecendants"] = 2] = "DirectDecendants";
    ShowBehavior[ShowBehavior["AllDecendants"] = 3] = "AllDecendants";
})(ShowBehavior = exports.ShowBehavior || (exports.ShowBehavior = {}));


/***/ }),
/* 3 */,
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineStyle = `
  [{@uid}] * {
    pointer-events: none;
  }

  [{@uid}] .focused, svg .focused > * {
    pointer-events: initial;
  }
`;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SelectionChangeEventReason;
(function (SelectionChangeEventReason) {
    SelectionChangeEventReason[SelectionChangeEventReason["SelectionChanged"] = 1] = "SelectionChanged";
    SelectionChangeEventReason[SelectionChangeEventReason["LockOverride"] = 2] = "LockOverride";
})(SelectionChangeEventReason = exports.SelectionChangeEventReason || (exports.SelectionChangeEventReason = {}));
class SelectionChangeEvent {
}
exports.SelectionChangeEvent = SelectionChangeEvent;


/***/ })
],[1]);