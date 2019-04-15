import * as d3 from "d3";
import { readFileSync } from "fs";

console.log("parsing");
const data = d3.csvParse(readFileSync(`${__dirname}/data.csv`, "utf-8"));
console.table(data);
console.log("parsing complete");
