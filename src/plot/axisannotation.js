'use strict';

/**
 * TODO Refactor this to techan.plot.annotation.axis()?
 */
module.exports = function(d3_svg_axis, plot) {  // Injected dependencies
  return function() { // Closure function
    var axis = d3_svg_axis(),
        format,
        point = 4,
        height = 14,
        width = 50,
        translate = [0, 0];

    function annotation(g) {
      var group = plot.groupSelect(
        g.append('g').attr("transform", "translate(" + translate[0] + "," + translate[1] + ")"),
        plot.dataMapper.unity
      );

      group.entry.append('path');
      group.entry.append('text');

      annotation.refresh(g);
    }

    annotation.refresh = function(g) {
      var fmt = format ? format :
        axis.tickFormat() ? axis.tickFormat() : axis.scale().tickFormat();

      refresh(g, axis, fmt, height, width, point);
    };

    annotation.axis = function(_) {
      if(!arguments.length) return axis;
      axis = _;
      return annotation;
    };

    annotation.format = function(_) {
      if(!arguments.length) return format;
      format = _;
      return annotation;
    };

    annotation.height = function(_) {
      if(!arguments.length) return height;
      height = _;
      return annotation;
    };

    annotation.width = function(_) {
      if(!arguments.length) return width;
      width = _;
      return annotation;
    };

    annotation.translate = function(_) {
      if(!arguments.length) return translate;
      translate = _;
      return annotation;
    };

    return annotation;
  };
};

function refresh(g, axis, format, height, width, point) {
  var scale = axis.scale(),
      neg = axis.orient() === 'left' || axis.orient() === 'top' ? -1 : 1;

  g.selectAll('path').attr('d', backgroundPath(axis, height, width, point, neg));

  var text = g.selectAll('text').text(textValue(format));

  switch(axis.orient()) {
    case 'left':
    case 'right':
      text.attr({
        x: neg*(Math.max(axis.innerTickSize(), 0) + axis.tickPadding()),
        y: textPosition(scale),
        dy: '.32em'
      }).style('text-anchor', neg < 0 ? 'end' : 'start');
      break;
    case 'top':
    case 'bottom':
      text.attr({
        x: textPosition(scale),
        y: neg*(Math.max(axis.innerTickSize(), 0) + axis.tickPadding()),
        dy: neg < 0 ? '0em' : '.72em'
      }).style('text-anchor', 'middle');
      break;
  }
}

function textPosition(scale) {
  return function(d) {
    var value = scale(d.value);
    if(!value || isNaN(value)) return null;
    return value;
  };
}

function textValue(format) {
  return function(d) {
    if(!d.value) return null;
    return format(d.value);
  };
}

function backgroundPath(axis, height, width, point, neg) {
  return function(d) {
    if(!d.value) return "M 0 0";

    var scale = axis.scale(),
        value = scale(d.value),
        pt = point;

    if(isNaN(value)) return "M 0 0";

    switch(axis.orient()) {
      case 'left':
      case 'right':
        var h = 0;

        if(height/2 < point) pt = height/2;
        else h = height/2-point;

        return [
          'M', 0, value,
          'l', neg*axis.innerTickSize(), -pt,
          'l', 0, -h,
          'l', neg*width, 0,
          'l', 0, height,
          'l', neg*-width, 0,
          'l', 0, -h
        ].join(' ');
      case 'top':
      case 'bottom':
        var w = 0;

        if(width/2 < point) pt = width/2;
        else w = width/2-point;

        return [
          'M', value, 0,
          'l', -pt, neg*axis.innerTickSize(),
          'l', -w, 0,
          'l', 0, neg*height,
          'l', width, 0,
          'l', 0, neg*-height,
          'l', -w, 0
        ].join(' ');
      default: throw "Unsupported axis.orient() " + axis.orient();
    }
  };
}