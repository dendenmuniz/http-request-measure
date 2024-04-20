const axios = require("axios");
const fs = require("fs");

const url = process.argv[2];
const limit = process.argv[3] || Infinity;
const maxRate = process.argv[4] || 4;
const outputFile = process.argv[5];

let requestsMade = 0;
let measurements = {};
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
  const bin = Math.floor(duration / 50) * 50;

  measurements[bin] = (measurements[bin] || 0) + 1;

  console.log(`Histogram for ${url} limit ${limit} with maxRate: ${maxRate} requests per second:`);
  for (const bin in measurements) {
    console.log(`${bin} ms: ${measurements[bin]}`);
  }

  requestsMade++;

  // Write measurements to file if specified
  if (outputFile) {
    if (!outputStream) {
      outputStream = fs.createWriteStream(outputFile, { flags: "a" });
      outputStream.write(`Histogram for ${url} limit ${limit} with maxRate: ${maxRate} requests per second:\n`);
    }
    outputStream.write(`${duration} ms\n`);
  }

  // Throttle requests
  setTimeout(() => {
    if (requestsMade < limit) {
      sendRequest();
    }
  }, 1000 / maxRate);
};

sendRequest();

// Close the output stream when the program exits
process.on("SIGINT", () => {
  if (outputStream) {
    outputStream.end();
  }
  process.exit();
});