exports.getEnv = function(){
  switch(process.env.NODE_ENV){
    case 'development':
      return 'development'
    case 'production':
      return 'production'
    default:
      return 'ERROR'
  }
}