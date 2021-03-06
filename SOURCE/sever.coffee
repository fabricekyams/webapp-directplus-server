###class Serveur
  constructor: () ->

  init: ->###
express = require 'express'
app = express()
server = require('http').createServer app
io = require('socket.io').listen server
server.listen 3000
io.set 'log level' , 1
io.set 'transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
DBCom = require('./DBCom.js')
DBCreate = require('./DBCreate.js')


io.sockets.on 'connection' , (socket) =>
  
  ### CONNECTION DE L'ADMIN ###
  console.log socket.id    
  socket.on 'slider', (id) =>
    DBCom.readSlideListForSlider id, (dbdata)=>
      socket.emit 'sslides', dbdata
    #TODO CHECK BD FOR ADMIN
    console.log 'admin connected'

    
  ### ###
  socket.on 'reset', (data) =>
    console.log 'admin asks for reseting'
    socket.broadcast.emit 'sreset', data


  ### CONNECTION USER ###
  socket.on 'user', (data)=>
    #socket.emit 'organisations', organisations
    DBCom.getOrgaList (dbdata)=>
      socket.emit 'organisations', dbdata
    console.log 'user connected'

  socket.on 'allConfs',(unepage)=>
    page = parseInt unepage
    console.log "all page:", page
    DBCom.readAllConferences page , (dbdata)=>
      if page is 1 
        console.log "la page est 1"
        socket.emit 'allconferences', dbdata
      else 
        socket.emit 'allNextPage', dbdata , page

 
  ### CONNECTION DE L'ADMIN###
  socket.on 'admin', (email)=>
    console.log "received connection from admin: ", email
    DBCom.getOrgaListfromAdmin email, (dbdata)=>
      console.log dbdata
      socket.emit 'organisations' , dbdata 


  ### CHOIX DE L'ORGANISATION PAR LE USER ###
  socket.on 'organisationChoosed', (id, unepage)=>
    console.log "la page:", unepage
    page = parseInt unepage
    console.log "page: ", page
    DBCom.readConference id, page, (dbdata)=>
      if page is 1
        socket.emit 'conferences', dbdata
      else
        socket.emit 'conferencesNextPage', dbdata , page

  socket.on 'organisationChoosedForAdmin', (id)=>
    DBCom.readConferenceForAdmin id, (dbdata)=>
      socket.emit 'conferences', dbdata

  socket.on 'nextPageOfOrg', (data)=>
    DBCom.readConference data.id, data.page, (dbdata)=>
      socket.emit 'nextConferences', dbdata


  ### CHOIX DE LA CONFERENCE PAR LE USER ###
  socket.on 'conferenceChoosed', (id)=>
    socket.leave socket.roomin if socket.roomin
    socket.roomin = id
    socket.join socket.roomin
    DBCom.readSlideList id, (dbdata)=>
      socket.emit 'slides', dbdata



  ### ENVOIE D'UN SLIDE PAR L'ADMIN ###
  socket.on 'send', (data) =>
    console.log data
    DBCom.readSlideToSend data, (dbdata)=>
      DBCom.setSent true , data
      socket.emit 'sent', data
      socket.broadcast.to(dbdata._conf).emit 'snext', dbdata


  ### RETRAIT D'UN SLIDE PAR L'ADMIN ###
  socket.on 'remove', (data) =>
    DBCom.readSlideToSend data, (dbdata)=>
      DBCom.setSent false , data
      socket.emit 'sremove', data 
      brodcastSlide 'sremove', dbdata 


  ### CREATION D'UN SLIDE PAR L'ADMIN ###
  socket.on 'createSlide', (data)=>
    #console.log data
    DBCreate.CreateSlide data, (dbdata)=>
      console.log dbdata
      socket.emit 'slideCreated', dbdata


  ### UPDATE D'UN SLIDE PAR L'ADMIN ###
  socket.on 'updateSlide', (data)=>
    DBCreate.UpdateSlide data, (dbdata)=>
      socket.emit 'slideUpdated', dbdata
      if dbdata.Sent is true
        socket.broadcast.to(dbdata._conf).emit 'slideUpdated', dbdata
        # ...
      

  ### SUPPRESSION D'UNE SLIDE PAR L'ADMIN ###
  socket.on 'deleteSlide', (data)=>
    console.log 'reçu un slide à detruire'
    DBCreate.DeleteSlide data, (dbdata)=>
      console.log dbdata
      socket.emit 'slideDeleted', (dbdata._id)
      if dbdata.Sent is true
        brodcastSlide 'sremove', dbdata 

  socket.on 'newOrganisation', (data)=>
    console.log data
    DBCreate.CreateOrganisation data, (dbdata)=>
      socket.emit 'orgCreated', dbdata

  socket.on 'newConference', (data)=>
    DBCreate.CreateConference data, (dbdata)=>
      socket.emit 'confCreated', dbdata

  socket.on 'deleteconf', (data)=>
    DBCreate.DeleteConference data , (dbdata)=>
      socket.emit 'confdeleted', dbdata 
  
  socket.on 'deleteorg', (data)=>
    DBCreate.DeleteOrganisation data, (dbdata)=>
      socket.emit 'orgdeleted', dbdata

  socket.on 'updateorg', (data)=>
    console.log 'updateorg',data
    DBCreate.UpdateOrganisation data, (dbdata)=>
      console.log 'org update: ', dbdata
      socket.emit 'orgupdated', dbdata

  socket.on 'updateconf', (data)=>
    DBCreate.UpdateConference data , (dbdata)=>
      socket.emit 'confu pdated', dbdata 




  brodcastSlide = (message, dbdata) =>
    console.log dbdata._conf
    io.sockets.in(dbdata._conf).emit message , dbdata
  

console.log 'Serveur lancé'

  