// Generated by CoffeeScript 1.6.2
var ConferenceSchema, Schema, mongoose;

mongoose = require("mongoose");

Schema = mongoose.Schema;

ConferenceSchema = Schema({
  _orga: {
    type: Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  date: Date,
  thumb: {
    type: String
  },
  description: {
    type: String
  },
  slides: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Slide',
      index: {
        unique: true
      }
    }
  ]
});

module.exports = mongoose.model('Conference', ConferenceSchema, 'conferences');
