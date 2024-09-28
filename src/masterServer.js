const fs = require("node:fs");
const path = require("path");

const STATIC_MASTER_SERVER_ID = 1

// For a basic implementation, we can settle with single static master
class MasterServer {

  constructor() {
    this.serverId = STATIC_MASTER_SERVER_ID

    // init log file to store oplogs
    this.oplogFileName = `master-oplog-${this.serverId}`
    this.oplogFilePath = path.join(__dirname, this.oplogFileName)
    this.filesCollection = {}
    this.chunkServers = []

    // // construct the filesCollection from OpLog if available.
    // this.loadFromOpLog();
  }

  logOperation(opLog) {
    console.log("opLog = ", opLog)
    fs.appendFileSync(this.oplogFilePath, opLog)
  }

  loadFromOpLog() {
    if(!fs.existsSync(this.oplogFilePath)) {
      console.log("MASTER-SERVER-INIT-LOADING - case 1 exit")
      return
    }

    // OpLog is expected to be very small in size
    // Hence we can readFileSync in this case
    const data = fs.readFileSync(this.oplogFilePath, "utf-8")//, (err, data) => {
    console.log("loadFromOpLog.data = ", data)
    const operationLogs = data.split(/\n/)
    
    operationLogs.forEach(operationLog => {
      
      const operationDetails = operationLog.split("|")

      const operation = operationDetails[0]
      const sourceFilePath = operationDetails[1]
      const chunkOfFileIdentifier = operationDetails[2]

      // simple conditional checks as the number of operations are very less
      if(operation == "CHUNK_CREATED") {
        if( this.filesCollection[ sourceFilePath ] ) {
          this.filesCollection[ sourceFilePath ].push( chunkOfFileIdentifier )
        } else {
          this.filesCollection[ sourceFilePath ] = [ chunkOfFileIdentifier ]
        }
      }
      
    });

    console.log("MASTER-SERVER-INIT-LOADING COMPLETED")
  }

  registerChunkServer(chunkServer) {
    console.log("registering chunk server - ", chunkServer)
    this.chunkServers.push( chunkServer )

    console.log("this.chunkServers - ", this.chunkServers)
  }

  getChunkServers(numChunks) {
    console.log("getChunkServers.numChunks = ", numChunks)
    
    const chunkIndexToChunkServerMapping = {}

    // use round-robin to assign chunks to chunk servers
    for(let i = 0; i < numChunks; i++) {
      const chunkServerIndexForCurrentChunk = i % this.chunkServers.length
      chunkIndexToChunkServerMapping[ i ] = this.chunkServers[chunkServerIndexForCurrentChunk]
    } 
    
    return chunkIndexToChunkServerMapping
  }

  pushNewChunkData(fileId, chunkId, chunkServerId) {
    if(! this.filesCollection[ fileId ]) {
      this.filesCollection[ fileId ] = []
    }
    
    this.filesCollection[ fileId ].push({
      chunkId, 
      chunkServerId
    })

    return true
  }

  getFileChunkDetails(fileId) {
    return this.filesCollection[ fileId ]
  }

  getAllChunkServers() {
    return this.chunkServers
  }
}

module.exports = {
  MasterServer
}