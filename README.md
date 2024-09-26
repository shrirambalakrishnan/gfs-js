NodeJS implementation of the white paper - Google File System

Features
- Master node
- Chunk servers
- GFS Client
  - stores file in multiple chunks
    - chunks data
    - stores chunks in various chunk servers
  - reads file
    - gets chunk details from master
    - reads chunk from chunk servers
    - regenerates the file from chunks