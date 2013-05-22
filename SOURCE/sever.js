// Generated by CoffeeScript 1.6.2
/*class Serveur
  constructor: () ->

  init: ->
*/

var DBCom, DBCreate, app, express, io, server,
  _this = this;

express = require('express');

app = express();

server = require('http').createServer(app);

io = require('socket.io').listen(server);

server.listen(3000);

io.set('log level', 1);

io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);

DBCom = require('./DBCom.js');

DBCreate = require('./DBCreate.js');

io.sockets.on('connection', function(socket) {
  /* CONNECTION DE L'ADMIN
  */

  var brodcastSlide;

  console.log(socket.id);
  socket.on('slider', function(id) {
    DBCom.readSlideListForSlider(id, function(dbdata) {
      return socket.emit('sslides', dbdata);
    });
    return console.log('admin connected');
  });
  /*
  */

  socket.on('reset', function(data) {
    console.log('admin asks for reseting');
    return socket.broadcast.emit('sreset', data);
  });
  /* CONNECTION USER
  */

  socket.on('user', function(data) {
    DBCom.getOrgaList(function(dbdata) {
      return socket.emit('organisations', dbdata);
    });
    return console.log('user connected');
  });
  socket.on('allConfs', function(unepage) {
    var page;

    page = parseInt(unepage);
    console.log("all page:", page);
    return DBCom.readAllConferences(page, function(dbdata) {
      if (page === 1) {
        console.log("la page est 1");
        return socket.emit('allconferences', dbdata);
      } else {
        return socket.emit('allNextPage', dbdata, page);
      }
    });
  });
  /* CONNECTION DE L'ADMIN
  */

  socket.on('admin', function(email) {
    console.log("received connection from admin: ", email);
    return DBCom.getOrgaListfromAdmin(email, function(dbdata) {
      console.log(dbdata);
      return socket.emit('organisations', dbdata);
    });
  });
  /* CHOIX DE L'ORGANISATION PAR LE USER
  */

  socket.on('organisationChoosed', function(id, unepage) {
    var page;

    console.log("la page:", unepage);
    page = parseInt(unepage);
    console.log("page: ", page);
    return DBCom.readConference(id, page, function(dbdata) {
      if (page === 1) {
        return socket.emit('conferences', dbdata);
      } else {
        return socket.emit('conferencesNextPage', dbdata, page);
      }
    });
  });
  socket.on('organisationChoosedForAdmin', function(id) {
    return DBCom.readConferenceForAdmin(id, function(dbdata) {
      return socket.emit('conferences', dbdata);
    });
  });
  socket.on('nextPageOfOrg', function(data) {
    return DBCom.readConference(data.id, data.page, function(dbdata) {
      return socket.emit('nextConferences', dbdata);
    });
  });
  /* CHOIX DE LA CONFERENCE PAR LE USER
  */

  socket.on('conferenceChoosed', function(id) {
    var channel, hash, roomClients, rooms, _i, _len;

    hash = {};
    rooms = socket.manager.rooms;
    roomClients = socket.manager.roomClients;
    console.log("roomsc", roomClients);
    console.log("rooms", rooms);
    for (_i = 0, _len = rooms.length; _i < _len; _i++) {
      channel = rooms[_i];
      console.log("channelllllllll,", channel);
      if (roomClients[socket.id][channel] === true) {
        hash[channel] = channel;
        console.log("hash:", hash);
      }
    }
    socket.join(id);
    return DBCom.readSlideList(id, function(dbdata) {
      return socket.emit('slides', dbdata);
    });
  });
  /* ENVOIE D'UN SLIDE PAR L'ADMIN
  */

  socket.on('send', function(data) {
    console.log(data);
    return DBCom.readSlideToSend(data, function(dbdata) {
      DBCom.setSent(true, data);
      socket.emit('sent', data);
      return brodcastSlide('snext', dbdata);
    });
  });
  /* RETRAIT D'UN SLIDE PAR L'ADMIN
  */

  socket.on('remove', function(data) {
    return DBCom.readSlideToSend(data, function(dbdata) {
      DBCom.setSent(false, data);
      socket.emit('sremove', data);
      return brodcastSlide('sremove', dbdata);
    });
  });
  /* CREATION D'UN SLIDE PAR L'ADMIN
  */

  socket.on('createSlide', function(data) {
    return DBCreate.CreateSlide(data, function(dbdata) {
      console.log(dbdata);
      return socket.emit('slideCreated', dbdata);
    });
  });
  /* UPDATE D'UN SLIDE PAR L'ADMIN
  */

  socket.on('updateSlide', function(data) {
    return DBCreate.UpdateSlide(data, function(dbdata) {
      socket.emit('slideUpdated', dbdata);
      if (dbdata.Sent === true) {
        return brodcastSlide('slideUpdated', dbdata);
      }
    });
  });
  /* SUPPRESSION D'UNE SLIDE PAR L'ADMIN
  */

  socket.on('deleteSlide', function(data) {
    console.log('reçu un slide à detruire');
    return DBCreate.DeleteSlide(data, function(dbdata) {
      console.log(dbdata);
      socket.emit('slideDeleted', dbdata._id);
      if (dbdata.Sent === true) {
        return brodcastSlide('sremove', dbdata);
      }
    });
  });
  socket.on('newOrganisation', function(data) {
    console.log(data);
    return DBCreate.CreateOrganisation(data, function(dbdata) {
      return socket.emit('orgCreated', dbdata);
    });
  });
  socket.on('newConference', function(data) {
    return DBCreate.CreateConference(data, function(dbdata) {
      return socket.emit('confCreated', dbdata);
    });
  });
  socket.on('deleteconf', function(data) {
    return DBCreate.DeleteConference(data, function(dbdata) {
      return socket.emit('confdeleted', dbdata);
    });
  });
  socket.on('deleteorg', function(data) {
    return DBCreate.DeleteOrganisation(data, function(dbdata) {
      return socket.emit('orgdeleted', dbdata);
    });
  });
  socket.on('updateorg', function(data) {
    console.log(data);
    return DBCreate.UpdateOrganisation(data, function(dbdata) {
      console.log('org update: ', dbdata);
      return socket.emit('orgupdated', dbdata);
    });
  });
  socket.on('updateconf', function(data) {
    return DBCreate.UpdateConference(data, function(dbdata) {
      return socket.emit('confu pdated', dbdata);
    });
  });
  return brodcastSlide = function(message, dbdata) {
    console.log(dbdata._conf);
    return io.sockets["in"](dbdata._conf).emit(message, dbdata);
  };
});

console.log('Serveur lancé');
