const { FileProcessor } = require("./fileProcessor")

const fs = require("fs")
const path = require("path")

const filesCollection = {}

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
    const fileProcessor = new FileProcessor(sourceFilePath, 100, "chunks", filesCollection)
    fileProcessor.chunk().then(res => {
      if(res.status) {
        console.log("res.chunksInserted = ", res.chunksInserted)
        console.log("res.chunksInserted.length = ", res.chunksInserted.length)
        // filesCollection[sourceFilePath] = res.chunksInserted
        
        console.log("filesCollection = ", filesCollection)

        fileProcessor.read(filesCollection[sourceFilePath])
      }
    })
    
  })
  
  
}

main()