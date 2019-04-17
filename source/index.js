import * as d3 from "d3";
import { Sortable } from "dragtime";
import { readFileSync } from "fs";

const data = JSON.parse(readFileSync(`${__dirname}/data.json`, "utf-8"));

const BAR_HEIGHT = 20;
const BAR_CHART_WIDTH = 640;
const BAR_CHART_HEIGHT = BAR_HEIGHT * Object.keys(data).length;

const MOSAIC_CHART_WIDTH = 640;
const MOSAIC_CHART_HEIGHT = 640;

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
	left: 140,
};
const MOSAIC_MARGIN = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
};

const barChart = d3
	.select("#bar-chart")
	.append("svg")
	.attr("viewBox", `${-1 * BAR_MARGIN.left} ${-1 * BAR_MARGIN.top} ${BAR_MARGIN.left + BAR_CHART_WIDTH + BAR_MARGIN.right} ${BAR_MARGIN.top + BAR_CHART_HEIGHT + BAR_MARGIN.bottom}`);

const mosaicChart = d3
	.select("#mosaic-chart")
	.append("svg")
	.attr("viewBox", `${-1 * MOSAIC_MARGIN.left} ${-1 * MOSAIC_MARGIN.top} ${MOSAIC_MARGIN.left + BAR_CHART_WIDTH + MOSAIC_MARGIN.right} ${MOSAIC_MARGIN.top + BAR_CHART_HEIGHT + MOSAIC_MARGIN.bottom}`);

const hierarchy = d3.hierarchy(data[0])
	.sum(d => d.value);

const root = d3.treemap()
	.size([MOSAIC_CHART_WIDTH, MOSAIC_CHART_HEIGHT])
	.paddingInner(15)
	.tile(d3.treemapSliceDice)(hierarchy);

mosaicChart.selectAll(".box")
	.data(root.leaves())
	.enter()
	.append("rect")
	.attr("x", d => d.x0)
	.attr("y", d => d.y0)
	.attr("width", d => d.x1 - d.x0)
	.attr("height", d => d.y1 - d.y0)
	.attr("stroke", "white");

const barY = d3
	.scaleLinear()
	.range([0, BAR_CHART_WIDTH])
	.domain([
		0,
		d3.max(data, d => {
			return Object.keys(d.ratings).reduce((total, key) => {
				return total + d.ratings[key];
			}, 0);
		})
	]);

const barAxisXElement = barChart
	.append("g");

const update = order => {
	const sorted = data.sort((a, b) => {
		return d3.descending(a.ratings[order[0]], b.ratings[order[0]]);
	});

	const barX = d3
		.scaleBand()
		.range([0, BAR_CHART_HEIGHT])
		.domain(sorted.map(d => d.name));

	const barAxisX = d3
		.axisLeft(barX);

	const stacks = d3
		.stack()
		.keys(order)
		.order(d3.stackOrderNone)
		.value((d, key) => d.ratings[key])(sorted);

	stacks.map(stack => {
		barChart
			.selectAll(".bar")
			.data(stack)
			.enter()
			.append("rect")
			.attr("stroke", "black")
			.attr("x", d => barY(d[0]))
			.attr("y", d => barX(d.data.name))
			.attr("width", d => d[1] - d[0])
			.attr("height", d => barX.bandwidth())
			.attr("fill", d => COLORS[stack.key]);
	});
	barAxisXElement
		.call(barAxisX);
}
update(RATINGS);

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

sortable.addEventListener("dtdragdropped", () => {
	const order = sortable.toIndexArray().map(index => RATINGS[index]);
	update(order);
})

