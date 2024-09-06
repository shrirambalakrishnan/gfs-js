// V2
// Open file to get filedescriptor
// Use the filedescriptor to read select bytes from file
// 
// This method only loads the selected by to memory
// Hence this is better than V1

const fs = require("node:fs")
const { Buffer } = require("node:buffer")

const filepath = "sourceFile.md"
const CHUNK_SIZE_BYTES = 100

const readInChunks = async () => {
  fs.open(filepath, (err, fd) => {
    let readPosition = 0
    let buffer = Buffer.alloc( CHUNK_SIZE_BYTES )
    console.log("buffer = ", buffer)

    const readNextChunk = () => {

      fs.read( 
        fd, 
        {
          buffer: buffer, 
          position: readPosition,
          offset: 0, 
          length: CHUNK_SIZE_BYTES,
        }, 
        (err, bytesRead, buffer) => {

          if( bytesRead > 0 ) {

            console.log("bytesRead = ", bytesRead)
            console.log("buffer = ", buffer)
            console.log("buffer = ", buffer.toString())

            readPosition += CHUNK_SIZE_BYTES
        
            readNextChunk()
            
          } else {

            console.log("no bytes read. closing the file and exiting...")
            fs.close(fd)
            
          }
          
        }
      )
  
      
    }
    

    readNextChunk()
  })
}

const main = async () => {
  readInChunks()
}

main()