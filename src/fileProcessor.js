const fs = require("node:fs");
const path = require("path");

const { uuid } = require('uuidv4');

class FileProcessor {

  constructor(fileName, chunkSize, destinationDir, masterServer) {
    this.fileName = fileName;
    this.filePath = path.join(__dirname, fileName);
    this.chunkSize = chunkSize;
    this.destinationDir = destinationDir;
    this.masterServer = masterServer;
  }

  chunk() {    
    const chunksInserted = []
    return new Promise( (resolve, reject) => {
      let ongoingChunkingCount = 0
      let readingInChunksEnded = false

      const readStream = fs.createReadStream(
        this.filePath, 
        { highWaterMark: this.chunkSize }
      )
      let chunksReadCount = 0
    
      // on availability of data for CHUNK length
      // - read data
      // - console log data
      readStream.on("data", (chunk) => {
        ongoingChunkingCount++
        
        console.log(`recevied ${chunk.length} data...`)
        console.log(chunk)
        console.log(chunk.toString())
        const chunkIdentifier = uuid();
  
        const chunkDestFileName = `chunk_${chunkIdentifier}`
        const chunkFileDestPath = path.join(__dirname, this.destinationDir, chunkDestFileName);
        console.log("saving to chunk destination dir - ", chunkFileDestPath)
        
        fs.open(chunkFileDestPath, "w", (err, fd) => {
          console.log("fd = ", fd, chunksReadCount)
          
          chunksInserted.push( chunkIdentifier )
          console.log("pushed chunkidentifier to chunksInserted - ", chunkIdentifier)

          fs.writeFile(fd, chunk, (error) => {
            if(error) {
              console.log(`error writing to file ${chunkFileDestPath}`)
            } else {
              console.log(`writing to ${chunkFileDestPath} is complete.`)
  
              const opLogString = `CHUNK_CREATED|${this.filePath}|${chunkIdentifier}|${chunkFileDestPath}\n`
              this.masterServer.logOperation(opLogString)

              ongoingChunkingCount--
              
              fs.close(fd, (err) => {
                if(err) {
                  console.log(`!!!!!! error in closing file ${chunkFileDestPath}`)
                } else {

                  if(
                    readingInChunksEnded &&
                    ongoingChunkingCount == 0
                  ) {
                    this.masterServer.filesCollection[this.filePath] = chunksInserted
                    resolve({status: true, chunksInserted})
                  }
                  
                  console.log(`closed file ${chunkFileDestPath}`)
                }
              }) 
            }
          })
        })
  
        chunksReadCount++
      })
    
      readStream.on('end', () => {
        readingInChunksEnded = true
        console.log('Finished reading the file');
  
        if(readingInChunksEnded && ongoingChunkingCount == 0) {
          this.masterServer.filesCollection[this.filePath] = chunksInserted
          resolve({status: true, chunksInserted})
        }
      });
    })
  }
  
  read() {
    
    console.log("read starts")
    
    const chunkCombinedDestFileName = `chunk_combined_${this.fileName}`
    const chunkCombinedPath = path.join(__dirname, this.destinationDir, chunkCombinedDestFileName)

    function readChunkAndAppendToCombinedFile(fileChunks, chunkIndexToProcess, combinedFileFD, destinationDir) {
      console.log("~~~~~~~~~~~~~~~~~~~ starting readChunkAndWriteToCombinedFile...", chunkIndexToProcess, combinedFileFD)

      if(chunkIndexToProcess >= fileChunks.length) {
        return
      }
      
      const chunkToProcess = fileChunks[chunkIndexToProcess]
      
      let chunkSourceFileName = `chunk_${chunkToProcess}`
      let chunkSourceFilePath = path.join(__dirname, destinationDir, chunkSourceFileName)

      console.log("chunkCombinedDestFileName = ", chunkCombinedDestFileName)
      console.log("chunkCombinedPath = ", chunkCombinedPath)
      console.log("chunkSourceFilePath = ", chunkSourceFilePath)

      fs.readFile(chunkSourceFilePath, (err, data) => {
        if(err) {
          console.log(`Unable to read file ${chunkSourceFilePath}. breaking...`)
        }
        console.log("----- reading data = ", data)
        
        fs.writeFile(combinedFileFD, data, (err) => {
          if(err) {
            console.error(err)
            console.log("Unable to append to path. breaking...")
          }
          
          chunkIndexToProcess++
          readChunkAndAppendToCombinedFile(fileChunks, chunkIndexToProcess, combinedFileFD, destinationDir)
        })
      })
      
    }

    fs.open(chunkCombinedPath, "a", (err, fd) => {
      console.log("chunkCombinedPath.fd = ", fd)
      const chunkIndexToProcess = 0
      readChunkAndAppendToCombinedFile( this.masterServer.filesCollection[ this.filePath ], chunkIndexToProcess, fd, this.destinationDir )     
    })    
  }
}

module.exports = {
  FileProcessor
}