import * as d3 from "d3";
import { Sortable } from "dragtime";
import { readFileSync } from "fs";

const data = JSON.parse(readFileSync(`${__dirname}/data.json`, "utf-8"));

const BAR_HEIGHT = 20;
const BAR_CHART_WIDTH = 640;
const BAR_CHART_HEIGHT = BAR_HEIGHT * Object.keys(data).length;

const RATINGS = ["joy", "meh", "despair"];

const COLORS = {
	joy: "#96ea98",
	meh: "#aaaaaa",
	despair: "#d65959"
};

const MARGIN = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 140,
};

const barChart = d3
	.select("#bar-chart")
	.append("svg")
	.attr("viewBox", `${-1 * MARGIN.left} ${-1 * MARGIN.top} ${MARGIN.left + BAR_CHART_WIDTH + MARGIN.right} ${MARGIN.top + BAR_CHART_HEIGHT + MARGIN.bottom}`);

const sorted = data.sort((a, b) => {
	return d3.descending(a.totals.meh, b.totals.meh);
});

const x = d3
	.scaleLinear()
	.range([0, BAR_CHART_WIDTH])
	.domain([
		0,
		d3.max(data, d => {
			return Object.keys(d.totals).reduce((total, key) => {
				return total + d.totals[key];
			}, 0);
		})
	]);

const y = d3
	.scaleBand()
	.range([0, BAR_CHART_HEIGHT])
	.domain(sorted.map(d => d.name));

const axisY = d3
	.axisLeft(y);

const stacks = d3
	.stack()
	.keys(["joy", "meh", "despair"])
	.order(d3.stackOrderNone)
	.value((d, key) => d.totals[key])(sorted);

stacks.map(stack => {
	barChart
		.selectAll(".bar")
		.data(stack)
		.enter()
		.append("rect")
		.attr("stroke", "black")
		.attr("x", d => x(d[0]))
		.attr("y", d => y(d.data.name))
		.attr("width", d => d[1] - d[0])
		.attr("height", d => y.bandwidth())
		.attr("fill", d => COLORS[stack.key]);
});

barChart
	.append("g")
	.call(axisY);

const reorderElement = document.querySelector("#reorder");

RATINGS.map(rating => {
	const ratingElement = document.createElement("div");
	ratingElement.classList.add("rating-container");
	reorderElement.appendChild(ratingElement);

	const styledElement = document.createElement("div");
	styledElement.classList.add("rating");
	styledElement.textContent = rating;
	styledElement.style.backgroundColor = COLORS[rating];
	ratingElement.appendChild(styledElement);
});

const sortable = new Sortable(reorderElement);

