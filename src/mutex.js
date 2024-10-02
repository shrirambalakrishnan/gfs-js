class Mutex {

  constructor() {
    this.locked = false
    this.queue = []
  }

  acquireLock() {

    return new Promise( (resolve, reject) => {

      if(this.locked) {
        console.log("acquireLock - waiting in queue - 2")
        this.queue.push( resolve )
        
      } else {
        console.log("acquireLock - lock obtained - 1")
        this.locked = true
        resolve()
      }
      
    })
    
  }

  releaseLock() {

    if( this.queue.length == 0 ) {
      console.log("releaseLock - lock released - 1")
      this.locked = false

    } else {
      console.log("releaseLock - lock release in-progress - 2")

      const nextResolveFunctionInQueue = this.queue.shift()
      nextResolveFunctionInQueue()

    }
    
  }
  
}

module.exports = {
  Mutex
}