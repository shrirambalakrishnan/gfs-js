const fs = require("fs")
const path = require("path")
const { uuid } = require('uuidv4');

class ChunkServerV2 {

  constructor(id, masterServer) {
    this.id = id
    this.masterServer = masterServer
    this.chunkDir = `chunk-server-${this.id}`

    this.init()
  }

  init() {
    const chunksPath = path.join(__dirname, this.chunkDir)
    fs.rmSync(chunksPath, { recursive: true, force: true })
    fs.mkdirSync(chunksPath)
  }

  saveChunk(sourceFilePath, chunkData) {    
    const chunkIdentifier = uuid();
    const chunkFileName = chunkIdentifier;
    const chunkFilePath = path.join(__dirname, this.chunkDir, chunkFileName)
    
    return new Promise( (resolve, reject) => {

      fs.open(chunkFilePath, "w", (err, fd) => {

        fs.writeFile(fd, chunkData, (error) => {
  
          if(error) {
            console.log(`error writing to chunk file ${chunkFilePath}`)
          } else {
  
            console.log(
              "============================",
              "WRITE TO CHUNK SUCCESSFULL ",
              "sourceFilePath = ", sourceFilePath,
              "chunkServerId = ", this.id,
              "chunkIdentifier = ", chunkIdentifier,
              "chunkFilePath = ", chunkFilePath,
            )

            const opLogString = `CHUNK_CREATED||${sourceFilePath}||${this.id}||${chunkIdentifier}||${chunkFilePath}\n`
            this.masterServer.logOperation(opLogString)

            // update master metadata
            this.masterServer.pushNewChunkData(
              sourceFilePath,
              chunkIdentifier,
              this.id
            )
  
            fs.close(fd, (err) => {
              if(err) {
                console.log(`!!!!!! error in closing file ${chunkFilePath}`)
              } else {
                resolve({status: true})
              }
            })
          }
          
        })
        
      })

    })
    
  }

  getChunkFilePath(chunkIdentifier) {
    return path.join(__dirname, this.chunkDir, chunkIdentifier)
  }
}

module.exports = {
  ChunkServerV2
}