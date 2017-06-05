/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');
var moment = require('moment');

// Hook that counts the number of runners that have passed by a checkpoint
const countTimes = options => {
    return hook => {
        return new Promise((resolve, reject) => {
            // Services
            const timesService = hook.app.service('/times');
            var premises = [];
            if(hook.result.data){
              hook.result.data.forEach(item => {
                  premises.push(timesService.find({
                      query: {
                          checkpoint_id: item.num,
                          timestamp: {
                              "$gte" : moment().startOf('day'),
                              "$lt" :  moment().add(1, 'days').startOf('day')
                          }
                      }
                  }).then(data => {
                      item.count = data.total;
                  }));
              });
            } else if (hook.result && hook.result.num){
              premises.push(timesService.find({
                  query: {
                      checkpoint_id: hook.result.num,
                      timestamp: {
                          "$gte" : moment().startOf('day'),
                          "$lt" :  moment().add(1, 'days').startOf('day')
                      }
                  }
                }).then(data => {
                    hook.result.count = data.total;
                }));
            } else {
              resolve();
              return;
            }

            Q.allSettled(premises).then(results=>{
                resolve();
            });
        });
    };
};

module.exports = countTimes;
