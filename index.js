/**
 * @name sequencer-test
 */
 
var partialRight = function(f) {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments, 1);
 
    return function() {
        return f.apply(this, slice.call(arguments).concat(args));
    };
};
 
var halfStep = Math.pow(2, (1/12));
var wholeStep = Math.pow(halfStep, 2);
 
var scales = {
  major: ['w', 'w', 'h', 'w', 'w', 'w', 'h'],
  minor: ['w', 'h', 'w', 'w', 'h', 'w', 'w'],
};
 
var stepVal = function(step) {
  var mappings = {
    'w': wholeStep,
    'h': halfStep
  };
  return mappings[step];
};
 
var majorVal = partialRight(stepVal, scales.major);
var minorVal = partialRight(stepVal, scales.minor);
 
var applySteps = function(signal, steps) {
  return signal * (steps.length > 0
                     ?  steps.map(majorVal)
                             .reduce(function(a, b) { return a*b; })
                     : 1)
};
 
var notes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
 
var playNote = function(signal, note, scale) {
  var steps = scale.slice(0, notes.indexOf(note));
  return (steps.length > 0 ? applySteps(signal, steps) : signal);
};
 
var shiftOctave = function(signal, times) {
  for(i = 0; i < times; i++) signal = applySteps(signal, scales.major);
  return signal;
};
 
var JaggedArray = function() {
  var exports = {};
 
  var arr = exports.arr = [];
 
  var push = exports.push = function(index, item) {
    if(!arr[index]) arr[index] = [];
    arr[index].push(item);
  };
 
  var get = exports.get = function(index) {
    return arr[index] ? arr[index] : [];
  };
 
  return exports;
};
 
var Sequencer = (function(length){
  var exports = {};
 
  var scheduled = exports.scheduled = new JaggedArray();
 
  var schedule = exports.schedule = function(start, end, item) {
    scheduled.arr;
    for(var i = start; i <= end; i++)
      scheduled.push(i, item);
    return end - start;
  };
 
  var tick = exports.tick = function(time) {
    var step = Math.round(time) % length;
    var out = scheduled.get(step);//.reduce(function(a,b) { return a + b; }, 0);
    //console.log(out);
    return out.length > 0 ? out : [0];
  };
 
  return exports;
})(8);
 
var init = true;
var amplitude = 0.5;
var base = 2 * Math.PI * 440;

Sequencer.schedule(0, 1, playNote(base, 'a', scales.major));
Sequencer.schedule(2, 3, playNote(base, 'b', scales.major));
Sequencer.schedule(4, 5, playNote(base, 'c', scales.major));
Sequencer.schedule(6, 7, playNote(base, 'd', scales.major));
 
export function dsp(t) {
  return amplitude * Math.sin(t * Sequencer.tick(t)[0]);
}