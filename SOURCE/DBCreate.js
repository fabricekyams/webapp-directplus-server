// Generated by CoffeeScript 1.4.0
var Admin, Conference, Config, CreateConference, CreateOrganisation, CreateSlide, DeleteConference, DeleteOrganisation, DeleteSlide, Organisation, Schema, Slide, UpdateConference, UpdateOrganisation, UpdateSlide, confDB, dsn, mongoose,
  _this = this;

mongoose = require('mongoose');

Schema = mongoose.Schema;

Admin = require('./Models/Admin.js');

Slide = require('./Models/Slide.js');

Organisation = require("./Models/Organisation.js");

Conference = require("./Models/Conference.js");

Config = require("./config");

dsn = Config.dsn;

mongoose.createConnection(dsn);

confDB = mongoose.connection;

confDB.on('error', console.error.bind(console, 'connection error create:'));

module.exports.CreateSlide = CreateSlide = function(newslide, callback) {
  var conf, jsonData, type;
  conf = newslide._conf;
  type = newslide.type;
  jsonData = newslide.jsonData;
  return Conference.findOne({
    _id: conf
  }, function(err, conference) {
    var slide1;
    slide1 = new Slide({
      _conf: conference._id,
      Type: type,
      Sent: false,
      JsonData: jsonData
    });
    slide1.save(function(err, slide1) {
      if (err) {
        return console.log("erreur", err);
      }
    });
    callback(slide1);
    conference.slides.push(slide1);
    return conference.save(function(err, conference) {});
  }).populate('slides').exec(function(err, conferences) {});
};

module.exports.UpdateSlide = UpdateSlide = function(newslide, callback) {
  var id, jsonData;
  id = newslide._id;
  jsonData = newslide.jsonData;
  return Slide.findByIdAndUpdate(id, {
    JsonData: jsonData
  }, {
    "new": true
  }, function(err, slide) {
    return callback(slide);
  });
};

module.exports.DeleteSlide = DeleteSlide = function(slideId, callback) {
  return Slide.findByIdAndRemove(slideId, function(err, slide) {
    if (err) {
      console.log(err);
    }
    return callback(slide);
  });
};

module.exports.CreateConference = CreateConference = function(newconf, callback) {
  try {
    return Organisation.findOne({
      _id: newconf._orga
    }, function(err, organisation) {
      var conference, mydate;
      mydate = new Date(newconf.date);
      conference = new Conference({
        _orga: newconf._orga,
        name: newconf.name,
        date: mydate,
        tumb: newconf.tumb,
        description: newconf.description
      });
      return conference.save(function(err, conference) {
        if (err) {
          console.log("save erreur", err);
        }
        callback(conference);
        organisation.conferences.push(conference);
        return organisation.save(function(err, organisation) {
          return console.log('organisation: ', organisation);
        });
      });
    }).populate('conferences').exec(function(err, organisations) {
      return console.log("organisations", organisations);
    });
  } catch (e) {

  }
};

module.exports.CreateOrganisation = CreateOrganisation = function(newOrg, callback) {
  return Admin.findOne({
    email: 'seba@rtbf.be'
  }, function(err, admin) {
    var organisation;
    organisation = new Organisation({
      _admin: admin._id,
      name: newOrg.title,
      tumb: newOrg.tumb,
      description: newOrg.description
    });
    return organisation.save(function(err, organisation) {
      if (err) {
        console.log("erreur", err);
      }
      callback(organisation);
      admin.organisations.push(organisation);
      return admin.save(function(err, admin) {});
    });
  }).populate('organisations').exec(function(err, admins) {});
};

module.exports.DeleteConference = DeleteConference = function(confId, callback) {
  Slide.find({
    _conf: confId
  }, function(err, slides) {
    var x, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = slides.length; _i < _len; _i++) {
      x = slides[_i];
      _results.push(x.remove(function(err) {}));
    }
    return _results;
  });
  return Conference.findByIdAndRemove(confId, function(err, conference) {
    if (err) {
      console.log(err);
    }
    return callback(conference._id);
  });
};

module.exports.DeleteOrganisation = DeleteOrganisation = function(orgId, callback) {
  Conference.find({
    _orga: orgId
  }, function(err, conferences) {
    var x, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = conferences.length; _i < _len; _i++) {
      x = conferences[_i];
      _results.push(_this.DeleteConference(x, function(id) {
        return console.log(id);
      }));
    }
    return _results;
  });
  return Organisation.findByIdAndRemove(orgId, function(err, organisation) {
    if (err) {
      console.log(err);
    }
    return callback(organisation._id);
  });
};

module.exports.UpdateConference = UpdateConference = function(nconference, callback) {
  return Conference.findByIdAndUpdate(nconference._id, {
    name: nconference.name,
    date: nconference.date,
    tumb: nconference.tumb,
    description: nconference.description
  }, {
    "new": true
  }, function(err, conference) {
    return callback(conference);
  });
};

module.exports.UpdateOrganisation = UpdateOrganisation = function(norganisation, callback) {
  return Organisation.findByIdAndUpdate(norganisation._id, {
    name: norganisation.title,
    tumb: norganisation.tumb,
    description: norganisation.description
  }, {
    "new": true
  }, function(err, organisation) {
    console.log("organisation updated: ", organisation);
    return callback(organisation);
  });
};
