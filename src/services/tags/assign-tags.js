/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const Q = require('q');
const auth = require('@feathersjs/authentication');

const moment = require('moment');
require('moment/locale/es');
moment.locale('es');

module.exports = function () {
  const app = this;

  const tagsModel = require('./tag-model');
  const tagsService = app.service('/tags');
  const runnersModel = require('../runners/runner-model');
  const runnersService = app.service('/runners');
  const wavesModel = require('../waves/wave-model');
  const raceService = app.service('/race');

  class TagsAssigner {

    create(data, params, callback) {
      var race = null;
      var runners = [];
      var tags = [];
      var waves = [];
      // Promises array and calls to find()
      var promisesArray = [];
      //var promiseRace = raceService.find({});
      //promisesArray.push(promiseRace);
      var promiseTags = tagsModel.find({}).sort({ itr: 1, num: 1 });
      promisesArray.push(promiseTags);
      var deferred = Q.defer();
      promisesArray.push(deferred.promise);
      var promiseWaves = wavesModel.find({ chrono: true }).sort({ date: 1, num: 1 });
      promisesArray.push(promiseWaves);

      // Promises to get the data
      //promiseRace.then((raceRetrieved)=>{race = raceRetrieved.data[0]; console.log(raceRetrieved[0]);});
      promiseTags.then((tagsRetrieved) => { tags = tagsRetrieved; });
      promiseWaves.then((wavesRetrieved) => {
        waves = wavesRetrieved;
        var arrayNums = [];
        waves.forEach((wave) => {
          arrayNums.push(wave.num);
        });
        // We query the runners here so that we only get the runners inside waves that have "chrono" equals to true
        var promiseRunners = runnersModel.find({ wave_id: { $in: arrayNums } }).sort({ date: 1, wave_id: 1, team_name: 1, name: 1 });
        promiseRunners.then((runnersRetrieved) => {
          runners = runnersRetrieved;
          deferred.resolve(runners);
        }).catch((error) => {
          console.log(error);
        });
      });
      // Wait that all the promises are finished (in other words, that we get all the data needed)
      Q.allSettled(promisesArray).then((results) => {
        var indexTags = 0;
        var indexRunners = 0;
        var currentColor = tags[0].itr;
        var currentDate = runners[0].date;
        var onePassDone = false;
        while (indexTags < tags.length && indexRunners < runners.length) {
          var tag = tags[indexTags];
          var runner = runners[indexRunners];
          if ((tag.itr === currentColor && runner.date !== currentDate && !onePassDone) || (tag.assigned && onePassDone)) {
            indexTags++;
            continue;
          } else if (tag.itr !== currentColor && runner.date !== currentDate) {
            currentColor = tag.itr;
            currentDate = runner.date;
          }
          tag.assigned = true;
          tagsService.update(tag._id, tag).then(data => { }).catch(error => { console.log(error); });
          runner.tag = { num: tag.num, itr: tag.itr };
          runnersService.update(runner._id, runner).then(data => { }).catch(error => { console.log(error); });
          indexTags++;
          indexRunners++;
          if (indexTags === tags.length && !onePassDone) {
            indexTags = 0;
            onePassDone = true;
          }
        }
        callback();
      });
      raceService.patch(null, { tagsAssigned: true });
    }
    // END OF ASSIGN

    // Setup this service, needed by Feathersjs
    setup(app) {
      this.app = app;
    }
  }

  // Initialize excel-parser service
  app.use('/tags-assigner', new TagsAssigner());

  app.service('/tags-assigner').hooks({
    before: {
      all: [auth.hooks.authenticate('local')],
    }
  });

};
