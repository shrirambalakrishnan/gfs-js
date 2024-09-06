// V1
// Basic file reading
// uses "readFile"
// this loads the entire file into memory
// Hence this is not recommended

const filepath = "sourceFile.md"
const fs = require("node:fs")

const readInOneShot = () => {
  fs.readFile(filepath, "utf8", (err, data) => {

    if(err) {
      console.error("error - ", err)
      return
    }
    
    console.log(data)
  })
} 

const main = async () => {
  readInOneShot()
}

main()