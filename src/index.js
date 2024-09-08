const { FileProcessor } = require("./fileProcessor")

const main = () => {
  const sourceFilePath = "sourceFile.md"
  const fileProcessor = new FileProcessor(sourceFilePath, 100, "chunks")
  fileProcessor.chunk().then(res => {
    if(res.status) {
      fileProcessor.read()
    }
  })
}

main()