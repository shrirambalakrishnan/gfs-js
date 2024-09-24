const { MasterServer } = require("./masterServer")
const { ChunkServer } = require("./chunkServer")

const main = () => {

  // init master server
  const masterServer = new MasterServer()
  console.log("masterServer.filesCollection = ", masterServer.filesCollection)

  // init chunk server 1
  const chunkServer1 = new ChunkServer("ID-1", masterServer)

  // First file to chunk and store
  const sourceFilePath1 = "sourceFile.md"
  chunkServer1.chunk(sourceFilePath1).then( res => {
    console.log("chunkServer1.chunk response = ", res)
    console.log("masterServer.filesCollection = ", masterServer.filesCollection) 

    // regenerate the file from chunks
    chunkServer1.read(sourceFilePath1)
  })

}

main()