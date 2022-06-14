/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


// Hook that computes the speed of the runner when creating the result
const computeSpeed = context => {
  return new Promise((resolve, reject) => {
    var newResult = context.data;
    const checkpointsService = context.app.service('/checkpoints');
    checkpointsService.find().then((checkpoints) => {
      for (var i = 0; i < checkpoints.data.length; i++) {
        var checkpoint = checkpoints.data[i];
        if (newResult.times[checkpoint.num]) {
          var hours = newResult.times[checkpoint.num].duration;
          var speed = parseFloat((checkpoint.distance / hours) / 1000).toFixed(2);
          console.log("minutes: ",hours);
          console.log("distance: ",checkpoint.distance);
          console.log("speed: ",speed);
          newResult.times[checkpoint.num].speed = speed;
        }
      }
      resolve(context);
    });
  });
};

module.exports = computeSpeed;
