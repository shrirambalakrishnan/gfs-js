const { FileProcessor } = require("./fileProcessor")
const { MasterServer } = require("./masterServer")

const fs = require("fs")
const path = require("path")

const init = () => {
  return new Promise( (resolve, reject) => {
    const chunksFolderName = "chunks"
    const chunksPath = path.join(__dirname, chunksFolderName)
    
    fs.rmSync(chunksPath, { recursive: true, force: true })
    fs.mkdirSync(chunksPath)
    resolve( true )
  })
}

const main = () => {

  init().then( res => {

    if(!res) {
      console.error("init failed..")
      return
    }

    const sourceFilePath = "sourceFile.md"
    const masterServer = new MasterServer()
    console.log("masterServer.filesCollection = ", masterServer.filesCollection) 
    
    const fileProcessor = new FileProcessor(sourceFilePath, 100, "chunks", masterServer)
    fileProcessor.chunk().then(res => {
      if(res.status) {
        console.log("res.chunksInserted = ", res.chunksInserted)
        console.log("res.chunksInserted.length = ", res.chunksInserted.length)
        console.log("filesCollection = ", masterServer.filesCollection)

        fileProcessor.read(masterServer.filesCollection[sourceFilePath])
      }
    })

    // // Independently read chunks based on the state stored in "op logs"
    // fileProcessor.read(masterServer.filesCollection[sourceFilePath])
  })
  
  
}

main()