# HTTP Request Duration Measurement Tool

This Node.js program measures the duration of HTTP requests to a specified URL and generates a histogram of the request durations.

## Description

The Request Duration Measurement Tool sends HTTP requests to a specified URL and measures the time taken for each request to complete. It then generates a histogram of the request durations to visualize the distribution of request times.

## Features

- Measures the duration of HTTP requests to a specified URL.
- Supports limiting the number of requests and setting a maximum request rate.
- Generates a histogram of request durations.
- Outputs the histogram to the console and optionally to a file.

## Installation

1. Clone this repository:

```
git clone [<repository-url>](https://github.com/dendenmuniz/vyer-measure.git)
```

2. Navigate to the project directory:

```
cd vyer-measure
```

3. Install dependencies:

```
npm install
```

## Usage

Run the program using Node.js with the following command:

```
node measure.js <url> [limit] [maxRate] [outputFile]
```

Replace `<url>` with the URL to measure request durations. Optional arguments include:

- `limit`: The maximum number of requests to send (default is Infinity).
- `maxRate`: The maximum rate of requests per second (default is 4).
- `outputFile`: The name of the file to output the histogram data (optional).

Example usage:

```
node measure.js http://www.example.com 100 5 results.txt
```

## License

This project is licensed under the MIT License


