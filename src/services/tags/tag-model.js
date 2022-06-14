/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

// tag-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  num: { type: Number, required: true },
  itr: { type: String, required: true },
  assigned: { type: Boolean, 'default': false }
});

tagSchema.index({ num: 1, itr: 1 }, { unique: true });

const tagModel = mongoose.model('tags', tagSchema);

module.exports = tagModel;
