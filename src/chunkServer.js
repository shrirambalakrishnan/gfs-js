const { FileProcessor } = require("./fileProcessor")
const STATIC_CHUNK_SIZE = 100

const fs = require("fs")
const path = require("path")

class ChunkServer {

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
 
  chunk(filePath) {
    const fileProcessor = new FileProcessor(
      filePath,
      STATIC_CHUNK_SIZE,
      this.chunkDir,
      this.masterServer,
    )
    
    return new Promise( (resolve, reject) => {
      fileProcessor.chunk().then( res => {
        console.log("ChunkServer.chunk complete - ", filePath, res)
        resolve(true)
      })
    }) 
  }

  read(filePath) {
    const fileProcessor = new FileProcessor(
      filePath,
      STATIC_CHUNK_SIZE,
      this.chunkDir,
      this.masterServer,
    )
    
    fileProcessor.read()
  }
}

module.exports = {
  ChunkServer
}