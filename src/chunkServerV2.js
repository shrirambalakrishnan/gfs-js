const fs = require("fs")
const path = require("path")
const { uuid } = require('uuidv4');
const { Mutex } = require("./mutex")

class ChunkServerV2 {

  constructor(id, masterServer) {
    this.id = id
    this.masterServer = masterServer
    this.chunkLocks = {}
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

  appendToChunk(sourceFilePath, chunkIdentifier, chunkData) {
    const chunkFileName = chunkIdentifier;
    const chunkFilePath = path.join(__dirname, this.chunkDir, chunkFileName)

    // lock the chunk before appending to it
    let chunkLock = this.getChunkLock( chunkIdentifier )

    chunkLock.acquireLock().then( res => {

    fs.open(chunkFilePath, "a", (err, fd) => {
      fs.appendFile(fd, chunkData, (error) => { 
        if(error) {
          console.log("error appending to file - ", chunkFilePath)
        } else {

          console.log(
            "============================",
            "APPEND TO CHUNK SUCCESSFULL ",
            "sourceFilePath = ", sourceFilePath,
            "chunkServerId = ", this.id,
            "chunkIdentifier = ", chunkIdentifier,
            "chunkFilePath = ", chunkFilePath,
          )

          const opLogString = `CHUNK_APPENDED||${sourceFilePath}||${this.id}||${chunkIdentifier}||${chunkFilePath}\n`
          this.masterServer.logOperation(opLogString)

            chunkLock.releaseLock()
        }
      })
    })
      
    })
    
    
  }

  getChunkLock(chunkIdentifier) {

    if( !this.chunkLocks[chunkIdentifier] ) {
      this.chunkLocks[chunkIdentifier] = new Mutex()
    }

    return this.chunkLocks[chunkIdentifier]
  }
}

module.exports = {
  ChunkServerV2
}