const axios = require("axios");
const fs = require("fs");
const Table = require("cli-table3");

const url = process.argv[2];
const limit = process.argv[3] || Infinity;
const maxRate = process.argv[4] || 4;
const outputFile = process.argv[5];

let requestsMade = 0;
let measurements = [];
let outputStream;

const sendRequest = async () => {
  if (requestsMade >= limit) {
    return;
  }

  const startTime = new Date();
  try {
    await axios.get(url);
  } catch (error) {
    console.error(`Request failed: ${error}`);
    return;
  }
  const endTime = new Date();
  const duration = endTime - startTime;
  measurements.push(duration);

  requestsMade++;

  // Throttle requests
  setTimeout(() => {
    printResults();
    if (requestsMade < limit) {
      sendRequest();
    }
  }, 1000 / maxRate);
};

function printResults() {
  const minDuration = Math.min(...measurements); //round the minimum nearest whole number
  const maxDuration = Math.ceil(Math.max(...measurements)); //round the maximum nearest whole number
  const numBins = Math.ceil(Math.log2(measurements.length));
  const binSize = (maxDuration - minDuration) / numBins;
  const histogram = {};
  for (let i = 0; i < numBins; i++) {
    const binStart = minDuration + i * binSize;
    const binEnd = binStart + binSize;
    histogram[`${binStart.toFixed(0)}-${binEnd.toFixed(0)} ms`] = 0;
  }
  for (const duration of measurements) {
    const binIndex = Math.floor((duration - minDuration) / binSize);
    const binStart = minDuration + binIndex * binSize;
    const binEnd = binStart + binSize;
    histogram[`${binStart.toFixed(0)}-${binEnd.toFixed(0)} ms`]++;
  }

  const table = new Table({
    head: ["Bin", "Count"],
    colWidths: [30, 10],
  });

  for (const bin in histogram) {
    table.push([bin, histogram[bin]]);
  }

  console.log(
    `Histogram for ${url} limit: ${limit} with maxRate: ${maxRate} requests per second:`
  );
  console.log(table.toString());

  // Write measurements to file if specified
  if (outputFile) {
    if (!outputStream) {
      outputStream = fs.createWriteStream(outputFile, { flags: "a" });
      outputStream.write(
        `Histogram for ${url} limit: ${limit} with maxRate: ${maxRate} requests per second:\n`
      );
    }
    outputStream.write(table.toString() + "\n");
  }
}

sendRequest();

// Close the output stream when the program exits
process.on("SIGINT", () => {
  if (outputStream) {
    outputStream.end();
  }
  process.exit();
});
