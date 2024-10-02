NodeJS implementation of the paper - Google File System

Implementation
- Chunk Server
  - Holds the actual chunks of data belonging to file
- Master
  - Stores metadata of all the files and their chunks' details
- GFS Client
  - Uploads file in multiple chunks
    - Gets chunk details from Master (to store various chunks to chunk servers)
    - Chunks the file and uploads each chunk to respective chunk server
  - Reads file
    - Gets chunk details of file from master
    - Reads chunk from respective chunk servers as provided by master
    - Regenerates the file from chunks
  - Append to file
    - Atomic append to file's last chunk
