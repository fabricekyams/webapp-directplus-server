mongoose = require  "mongoose"
Schema = mongoose.Schema

console.log "let's create schemas"

ConferenceSchema = Schema
  _orga:
    type: Schema.Types.ObjectId
    ref: 'Organisation'
  name: String
  date: Date

OrganisationSchema = Schema
  _admin: 
    type: Schema.Types.ObjectId 
    ref: 'Admin'
  name: String
  date: Date
  conferences: [
    type: Schema.Types.ObjectId
    ref: 'Conference'] 

AdminSchema = Schema 
  firstname: String
  lastname: String
  email: 
    type: String
    required: true
    index:
      unique: true 
  ###organisations: [
    type: Schema.Types.ObjectId
    ref: 'Organisation' 
  ]###

module.exports= mongoose.model 'Admin', AdminSchema , 'admins'
module.exports= mongoose.model 'Organisation', OrganisationSchema , 'organisations'
module.exports= mongoose.model 'Conference', ConferenceSchema, 'conferences'

console.log "Schemas created"
  
