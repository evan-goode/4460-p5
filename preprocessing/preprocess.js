#!/usr/bin/env node
const fs = require("fs");
const d3 = require("d3");
const _ = require("lodash");

const candyNamesByField = {
	Q6_Butterfinger: "Butterfinger",
	Q6_Candy_Corn: "Candy Corn",
	Q6_Chiclets: "Chiclets",
	Q6_Dots: "Dots",
	Q6_Fuzzy_Peaches: "Fuzzy Peaches",
	Q6_Good_N_Plenty: "Good & Plenty",
	Q6_Gummy_Bears_straight_up: "Gummy bears",
	Q6_Healthy_Fruit: "Healthy Fruit",
	Q6_Heath_Bar: "Heath Bar",
	Q6_Hershey_s_Dark_Chocolate: "Hershey's Dark Chocolate",
	Q6_Hershey_s_Milk_Chocolate: "Hershey's Milk Chocolate",
	Q6_Hershey_s_Kisses: "Hershey's Kisses",
	Q6_Jolly_Rancher_bad_flavor: "Jolly Rancher (a bad flavor)",
	Q6_Jolly_Ranchers_good_flavor: "Jolly Rancher (a good flavor)",
	Q6_Junior_Mints: "Junior Mints",
	Q6_Kit_Kat: "Kit Kat",
	Q6_LaffyTaffy: "Laffy Taffy",
	Q6_LemonHeads: "Lemonhead",
	Q6_Licorice_not_black: "Licorice (not black)",
	Q6_Licorice_yes_black: "Licorice (black)",
	Q6_Lollipops: "Lollipops",
	Q6_Mike_and_Ike: "Mike and Ike",
	Q6_Milk_Duds: "Milk Duds",
	Q6_Milky_Way: "Milky Ways",
	Q6_Regular_M_Ms: "Regular M&M's",
	Q6_Peanut_M_M_s: "Peanut M&M's",
	Q6_Mint_Kisses: "Mint Kisses",
	Q6_Mr_Goodbar: "Mr. Goodbar",
	Q6_Nerds: "Nerds",
	Q6_Nestle_Crunch: "Nestlé crunch",
	Q6_Peeps: "Peeps",
	Q6_Pixy_Stix: "Pixy Stix",
	Q6_Reese_s_Peanut_Butter_Cups: "Reese's Peanut Butter Cups",
	Q6_Reese_s_Pieces: "Reese's Pieces",
	Q6_Rolos: "Rolos",
	Q6_Skittles: "Skittles",
	Q6_Snickers: "Snickers",
	Q6_Sourpatch_Kids_i_e_abominations_of_nature: "Sour Patch Kids",
	Q6_Starburst: "Starburst",
	Q6_Swedish_Fish: "Swedish Fish",
	Q6_Tic_Tacs: "Tic Tacs",
	Q6_Three_Musketeers: "3 Musketeers",
	Q6_Tolberone_something_or_other: "Toblerone",
	Q6_Trail_Mix: "Trail Mix",
	Q6_Twix: "Twix",
	Q6_Whatchamacallit_Bars: "Whatchamacallit Bars",
	Q6_York_Peppermint_Patties: "York Peppermint Patties"
};

const ageBins = [
	{ name: "29 or younger",  minimum: -Infinity, maximum: 30 },
	{ name: "30 to 39",  minimum: 30, maximum: 40 },
	{ name: "40 to 49",  minimum: 40, maximum: 50 },
	{ name: "51 or older",  minimum: 50, maximum: Infinity },
];
const getAgeBin = age => {
	return ageBins.find(ageBin => ageBin.minimum <= age && age < ageBin.maximum).name;
};

const generateRatingStructure = () => ({
	joy: 0,
	meh: 0,
	despair: 0,
});

const generateAgeStructure = () => {
	return ageBins.reduce((ageStructure, ageBin) => {
		return Object.assign({}, ageStructure, {
			[ageBin.name]: generateRatingStructure()
		});
	}, {});
};

const generateCandyStructure = () => {
	return Object.values(candyNamesByField).reduce((candyStructure, candyName) => {
		return Object.assign(candyStructure, {
			[candyName]: {
				totals: generateRatingStructure(),
				ages: generateAgeStructure()
			}
		});
	}, {});
};

const possibleRatings = generateRatingStructure();

const data = d3.csvParse(fs.readFileSync(0, "utf-8")); // read from stdin

const fullCandyStructure = data.reduce((candyStructure, row, index) => {
	console.error(`processing row ${index + 1} of ${data.length}`);
	const age = parseInt(row.Q3_AGE);
	if (isNaN(age)) return candyStructure;

	const ageBin = getAgeBin(age);
	return Object.keys(candyNamesByField).reduce((candyStructure, field) => {
		const candyName = candyNamesByField[field];
		const rating = row[field].toLowerCase();
		if (!(rating in possibleRatings)) return candyStructure;
		return _.merge(candyStructure, {
			[candyName]: {
				totals: {
					[rating]: candyStructure[candyName].totals[rating] + 1,
				},
				ages: {
					[ageBin]: {
						[rating]: candyStructure[candyName].ages[ageBin][rating] + 1
					}
				}
			}
		});
	}, candyStructure);
}, generateCandyStructure());

process.stdout.write(JSON.stringify(fullCandyStructure)); // write to stdout
