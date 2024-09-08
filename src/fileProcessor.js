const fs = require("node:fs");
const path = require("path");

class FileProcessor {

  constructor(filePath, chunkSize, destinationDir) {
    this.filePath = path.join(__dirname, filePath);
    this.chunkSize = chunkSize;
    this.destinationDir = destinationDir;
  }

  chunk() {    
    return new Promise( (resolve, reject) => {

      const readStream = fs.createReadStream(
        this.filePath, 
        { highWaterMark: this.chunkSize }
      )
      let chunksReadCount = 0
    
      // on availability of data for CHUNK length
      // - read data
      // - console log data
      readStream.on("data", (chunk) => {
        console.log(`recevied ${chunk.length} data...`)
        console.log(chunk)
        console.log(chunk.toString())
  
        console.log("saving to chunk destination dir")
        const chunkDestFileName = `${this.destinationDir}_chunk_${chunksReadCount}`
        const chunkFileDestPath = path.join(__dirname, chunkDestFileName);
        
        fs.open(chunkDestFileName, "w", (err, fd) => {
          console.log("fd = ", fd, chunksReadCount)
          
          fs.writeFile(fd, chunk, (error) => {
            if(error) {
              console.log(`error writing to file ${chunkFileDestPath}`)
            } else {
              console.log(`writing to ${chunkFileDestPath} is complete.`)
  
              fs.close(fd, (err) => {
                if(err) {
                  console.log(`!!!!!! error in closing file ${chunkFileDestPath}`)
                } else {
                  console.log(`closed file ${chunkFileDestPath}`)
                }
              }) 
            }
          })
        })
  
        chunksReadCount++
      })
    
      readStream.on('end', () => {
        console.log('Finished reading the file');
  
        resolve({status: true})
      });
    })
  }
  
  read() {
    
    console.log("read starts")
    
    const chunkCombinedDestFileName = `${this.destinationDir}_chunk_combined`
    const chunkCombinedPath = path.join(__dirname, chunkCombinedDestFileName)

    function readChunkAndWriteToCombinedFile(chunkIdentifier, combinedFileFD, destinationDir) {
      console.log("~~~~~~~~~~~~~~~~~~~ starting readChunkAndWriteToCombinedFile...", chunkIdentifier, combinedFileFD)
      
      let chunkSourceFileName = `${destinationDir}_chunk_${chunkIdentifier}`
      let chunkSourceFilePath = path.join(__dirname, chunkSourceFileName)

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
          chunkIdentifier++
          readChunkAndWriteToCombinedFile(chunkIdentifier, combinedFileFD, destinationDir)
        })
      })
      
    }
    fs.open(chunkCombinedPath, "a", (err, fd) => {
      console.log("chunkCombinedPath.fd = ", fd)
      readChunkAndWriteToCombinedFile(0, fd, this.destinationDir)
    })    
  }
}

module.exports = {
  FileProcessor
}