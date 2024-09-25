const fs = require("node:fs");
const path = require("path");

const CHUNK_SIZE_BYTES = 100

class Client {

  constructor(id, master) {
    this.id = id

    // master is static as per this implementation
    this.master = master
  }

  getChunkServers(totalChunksCount) {
    return this.master.getChunkServers(totalChunksCount)
  }

  storeFile(filePath) {
    
    fs.stat(filePath, (err, stat) => {
      // get chunks from allocated from master
      // as master is responsible for chunk distribution
      const totalChunksCount = Math.ceil(stat.size / CHUNK_SIZE_BYTES)
      const chunkIndexToChunkServerMapping = this.getChunkServers(totalChunksCount)

      let currentChunkIndexCounter = 0
      const readStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE_BYTES})
      
      readStream.on("data", (chunk) => {
        console.log(`recevied ${chunk.length} data...`)
        
        const chunkServerAllocated = chunkIndexToChunkServerMapping[currentChunkIndexCounter]

        chunkServerAllocated.saveChunk(filePath, chunk).then( res => {
          console.log("Client.storeFile completed for chunk ")
        })

        currentChunkIndexCounter++
      })
    
      readStream.on('end', () => {
        console.log('Finished reading the file');
      });

    })
    
  }
  

}

module.exports = {
  Client
}