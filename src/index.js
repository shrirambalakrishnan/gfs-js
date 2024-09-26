const { MasterServer } = require("./masterServer")
const { ChunkServerV2 } = require("./chunkServerV2")
const { Client } = require("./client")

const path = require("path");

const main = () => {

  // init master server
  const masterServer = new MasterServer()
  console.log("masterServer.filesCollection = ", masterServer.filesCollection)

  // init chunk server 1
  const chunkServer1 = new ChunkServerV2("ID-1", masterServer)
  masterServer.registerChunkServer(chunkServer1)

  // init chunk server 2
  const chunkServer2 = new ChunkServerV2("ID-2", masterServer)
  masterServer.registerChunkServer(chunkServer2)

  // init Client
  const client = new Client("1", masterServer)
  
  // start file upload from client
  const sourceFileName = "sourceFile.md"
  const sourceFilePath = path.join(__dirname, sourceFileName)
  client.storeFile(sourceFilePath).then( res => {

    if( res.status ) {

      console.log("masterServer.filesCollection = ", masterServer.filesCollection)
      
    }
    
  })
}

main()