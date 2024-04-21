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
    } else {
      // Print final results and write to file
      printFinalResults();
    }
  }, 1000 / maxRate);
};

function printResults() {
  const minDuration = Math.min(...measurements);
  const maxDuration = Math.ceil(Math.max(...measurements));
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

  // Move cursor to beginning of output
  process.stdout.write("\x1B[0f");

  const table = new Table({
    head: ["Bin", "Count"],
    colWidths: [30, 10],
  });

  for (const bin in histogram) {
    table.push([bin, isNaN(histogram[bin]) ? 0 : histogram[bin]]);
  }

  console.log(
    `Histogram for ${url} limit${limit} with maxRate: ${maxRate} requests per second:`
  );
  console.log(table.toString());
}

function createHistogramTable(histogram) {
  const table = new Table({
    head: ["Bin", "Count"],
    colWidths: [30, 10],
  });

  for (const bin in histogram) {
    table.push([bin, isNaN(histogram[bin]) ? 0 : histogram[bin]]);
  }

  return table;
}

function printFinalResults() {
  const minDuration = Math.min(...measurements);
  const maxDuration = Math.ceil(Math.max(...measurements));
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

  // Write final measurements to file
  if (outputFile) {
    outputStream = fs.createWriteStream(outputFile);
    outputStream.write(
      `Histogram for ${url} limit${limit} with maxRate: ${maxRate} requests per second:\n`
    );
    outputStream.write(
      removeANSIEscapeCodes(createHistogramTable(histogram).toString()) + "\n"
    );
    outputStream.end();
  }
}

// Function to remove ANSI escape codes from a string
function removeANSIEscapeCodes(str) {
  return str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

sendRequest();

// Close the output stream when the program exits
process.on("SIGINT", () => {
  if (outputStream) {
    outputStream.end();
  }
  process.exit();
});
