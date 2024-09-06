// V3
// Use stream to read data in chunks from file
// This approach also does not load the entire file into memory like V2
// Easier approach than V2
// We can choose this approach to chunk a file for our GFS implementation

const fs = require("node:fs")
const path = require("path");
const filepath = path.join(__dirname, "sourceFile.md");
const CHUNK_SIZE_BYTES = 100

const readInChunks = async () => {
  const readStream = fs.createReadStream(filepath, { highWaterMark: CHUNK_SIZE_BYTES})

  // on availability of data for CHUNK length
  // - read data
  // - console log data
  readStream.on("data", (chunk) => {
    console.log(`recevied ${chunk.length} data...`)
    console.log(chunk)
    console.log(chunk.toString())
  })

  readStream.on('end', () => {
    console.log('Finished reading the file');
  });
}

const main = async () => {
  readInChunks()
}

main()