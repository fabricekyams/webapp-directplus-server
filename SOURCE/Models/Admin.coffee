mongoose = require  "mongoose"
Schema = mongoose.Schema

AdminSchema = Schema 
  firstname: 
    type: String
    required: true
  lastname: 
    type: String
    required: true
  email: 
    type: String
    required: true
    index:
      unique: true 
  organisations: [
    type: Schema.Types.ObjectId
    ref: 'Organisation' 
    index:
      unique: true
  ]



module.exports= mongoose.model 'Admin', AdminSchema , 'admins'