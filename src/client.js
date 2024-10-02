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
    
    return new Promise( (resolve, reject) => {
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

          resolve({status: true})
        });
  
      })
    })
    
  }

  readFile(filePath) {
    console.log("-------------- Client.readFile --------------")

    const fileName = path.basename(filePath)
    const newGeneratedFileName = `regenerated_${fileName}`
    const newGeneratedFilePath = path.join(__dirname, newGeneratedFileName)

    return new Promise( (resolve, reject) => {

      const chunkDetails = this.master.getFileChunkDetails(filePath)
      const allChunkServers = this.master.getAllChunkServers()

      console.log("chunkDetails = ", chunkDetails)
      console.log("allChunkServers = ", allChunkServers)
      console.log("newGeneratedFilePath = ", newGeneratedFilePath)

      fs.open(newGeneratedFilePath, "w", (err, fd) => {
        console.log("-- fd = ", fd)

        for(let i = 0; i < chunkDetails.length; i++) {
          console.log("------------ i = ", i)

          const currentChunkDetail = chunkDetails[i]
          console.log("currentChunkDetail = ", currentChunkDetail)
  
          const currentChunkServer = allChunkServers.find(_ => _.id == currentChunkDetail.chunkServerId)
          console.log("currentChunkServer = ", currentChunkServer)
  
          const currentChunkFilePath = currentChunkServer.getChunkFilePath(currentChunkDetail.chunkId)
          console.log("currentChunkFilePath = ", currentChunkFilePath, "fd = ", fd)
  
          fs.readFile(currentChunkFilePath, (err, data) => {
            if(err) {
              console.log("error in reading chunk, err - ", err)
            }

            console.log(`chunk data of ${i} = `, data)
  
            fs.appendFile(fd, data, (err) => {
              if(err) {
                console.error("error writing chunk to combined file, err - ", err)
              }

              console.log(`successfully written chunk ${i} to combined file...`)
            })
          })
        }
      })
    })
  }

  appendToFile(filePath, data) {
    const chunkServerDetail = this.master.getChunkServerToAppend(filePath)
    const chunkServerId = chunkServerDetail.chunkServerId
    const chunkId = chunkServerDetail.chunkId

    const allChunkServers = this.master.getAllChunkServers()
    const chunkServer = allChunkServers.find(_ => _.id == chunkServerId)
    
    chunkServer.appendToChunk(
      filePath,
      chunkId,
      data,
    )
  }
}

module.exports = {
  Client
}