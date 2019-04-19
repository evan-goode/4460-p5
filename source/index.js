import * as d3 from "d3";
import * as Sortable from "sortablejs";
import { readFileSync } from "fs";
import _ from "lodash";

const DATA = JSON.parse(readFileSync(`${__dirname}/data.json`, "utf-8"));
const INITIAL_SELECTION = _.maxBy(DATA, d => d.ratings.joy);

const ANIMATION_DURATION = 500; // milliseconds

const BAR_HEIGHT = 20;
const BAR_CHART_WIDTH = 640;
const BAR_CHART_HEIGHT = BAR_HEIGHT * Object.keys(DATA).length;

const MOSAIC_CHART_WIDTH = 480;
const MOSAIC_CHART_HEIGHT = 480;

const RATINGS = ["joy", "meh", "despair"];

const COLORS = {
	joy: "#96ea98",
	meh: "#aaaaaa",
	despair: "#d65959"
};

const BAR_MARGIN = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 140
};
const MOSAIC_MARGIN = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0
};

// mosaic chart
const mosaicChart = d3
	.select("#mosaic-chart")
	.append("svg")
	.attr(
		"viewBox",
		`${-1 * MOSAIC_MARGIN.left} ${-1 * MOSAIC_MARGIN.top} ${MOSAIC_MARGIN.left +
			MOSAIC_CHART_WIDTH +
			MOSAIC_MARGIN.right} ${MOSAIC_MARGIN.top +
			MOSAIC_CHART_HEIGHT +
			MOSAIC_MARGIN.bottom}`
	);

const treemap = d3
	.treemap()
	.size([MOSAIC_CHART_WIDTH, MOSAIC_CHART_HEIGHT])
	.paddingInner(10)
	.tile(d3.treemapSliceDice);

const generateMosaicChart = selection => {
	const hierarchy = d3.hierarchy(selection).sum(d => d.value);
	const root = treemap(hierarchy);
	return root;
};

const root = generateMosaicChart(INITIAL_SELECTION);
const boxElements = mosaicChart
	.selectAll(".box")
	.data(root.leaves())
	.enter()
	.append("rect")
	.attr("class", "box")
	.attr("fill", d => COLORS[d.data.name]);

const updateMosaicChart = (selection, animate) => {
	const root = generateMosaicChart(selection);
	boxElements
		.data(root.leaves())
		.transition()
		.duration(animate ? ANIMATION_DURATION : 0)
		.attr("x", d => d.x0)
		.attr("y", d => d.y0)
		.attr("width", d => d.x1 - d.x0)
		.attr("height", d => d.y1 - d.y0);
};
updateMosaicChart(INITIAL_SELECTION, false);

// bar chart
const barChart = d3
	.select("#bar-chart")
	.append("svg")
	.attr(
		"viewBox",
		`${-1 * BAR_MARGIN.left} ${-1 * BAR_MARGIN.top} ${BAR_MARGIN.left +
			BAR_CHART_WIDTH +
			BAR_MARGIN.right} ${BAR_MARGIN.top +
			BAR_CHART_HEIGHT +
			BAR_MARGIN.bottom}`
	);

const generateBarChart = order => {
	const sorted = DATA.sort((a, b) => {
		return d3.descending(a.ratings[order[0]], b.ratings[order[0]]);
	});
	const barX = d3
		.scaleBand()
		.range([0, BAR_CHART_HEIGHT])
		.domain(sorted.map(d => d.name));

	const barAxisX = d3.axisLeft(barX);

	const stacks = d3
		.stack()
		.keys(order)
		.order(d3.stackOrderNone)
		.value((d, key) => d.ratings[key] / d.total)(sorted);
	return { stacks, barX, barAxisX };
};

const barY = d3
	.scaleLinear()
	.range([0, BAR_CHART_WIDTH])
	.domain([0, 1]);

const barAxisXElement = barChart.append("g");

const { stacks, barX, barAxisX } = generateBarChart(RATINGS);
const stackElements = barChart
	.selectAll(".stack")
	.data(stacks)
	.enter()
	.append("g")
	.attr("class", "stack")
	.attr("fill", d => COLORS[d.key]);

const barElements = stackElements
	.selectAll(".bar")
	.data(d => d)
	.enter()
	.append("rect")
	.attr("class", "bar")
	.attr("stroke", "black");

const updateBarChart = (order, animate) => {
	const { stacks, barX, barAxisX } = generateBarChart(order);
	stackElements
		.data(stacks)
		.transition()
		.duration(animate ? ANIMATION_DURATION : 0)
		.attr("fill", d => COLORS[d.key]);
	barElements
		.data(d => d)
		.transition()
		.duration(animate ? ANIMATION_DURATION : 0)
		.attr("x", d => barY(d[0]))
		.attr("y", d => barX(d.data.name))
		.attr("width", d => barY(d[1]) - barY(d[0]))
		.attr("height", d => barX.bandwidth());
	barAxisXElement
		.transition()
		.duration(animate ? ANIMATION_DURATION : 0)
		.call(barAxisX);
};
updateBarChart(RATINGS, false);

barChart.selectAll(".bar").on("click", d => updateMosaicChart(d.data, true));

// reorder
const reorderContainerElement = document.querySelector("#reorder-container");
const totalBarChartWidth = BAR_MARGIN.left + BAR_CHART_WIDTH + BAR_MARGIN.right;
reorderContainerElement.style.paddingLeft = `${(100 * BAR_MARGIN.left) /
	totalBarChartWidth}%`;
const reorderElement = document.createElement("div");
reorderElement.classList.add("reorder");
reorderContainerElement.appendChild(reorderElement);

RATINGS.map(rating => {
	const ratingContainerElement = document.createElement("div");
	ratingContainerElement.classList.add("rating-container");
	ratingContainerElement.setAttribute("data-id", rating);
	reorderElement.appendChild(ratingContainerElement);
	const ratingElement = document.createElement("div");
	ratingElement.classList.add("inner-rating");
	ratingElement.textContent = rating;
	ratingElement.style.backgroundColor = COLORS[rating];
	ratingContainerElement.appendChild(ratingElement);
});

const sortable = Sortable.create(reorderElement, {
	animation: ANIMATION_DURATION,
	dataIdAttr: "data-id",
	onEnd: event => updateBarChart(sortable.toArray(), true)
});
