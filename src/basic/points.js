/*
	 ________  ________  ___  ________   _________
	|\   __  \|\   __  \|\  \|\   ___  \|\___   ___\
	\ \  \|\  \ \  \|\  \ \  \ \  \\ \  \|___ \  \_|
	 \ \   ____\ \  \\\  \ \  \ \  \\ \  \   \ \  \
	  \ \  \___|\ \  \\\  \ \  \ \  \\ \  \   \ \  \
	   \ \__\    \ \_______\ \__\ \__\\ \__\   \ \__\
	    \|__|     \|_______|\|__|\|__| \|__|    \|__|

 */

/*
	EXTERNAL DEPENDENCIES
 */
const ramda = require('ramda');

const compose = ramda.compose;
const pickBy = ramda.pickBy;
const not = ramda.not;

const isNil = ramda.isNil;
const applySpec = ramda.applySpec;
const merge = ramda.merge;
const mergeWith = ramda.mergeWith;

/*
	INTERNAL DEPENDENCIES
 */
const referenceHelpers = require('../utils/reference-helpers.js');
const getExecutedFn = referenceHelpers.getExecutedFn;
const getPropertyOrDefFn = referenceHelpers.getPropertyOrDefFn;
const getBlendFn = referenceHelpers.getBlendFn;
const getPropertyFnSafe = referenceHelpers.getPropertyFnSafe;
const getEitherProp = referenceHelpers.getEitherProp;
const getColorFn = referenceHelpers.getColorFn;
const TangramReference = require('../utils/reference');

const PR = TangramReference.getPoint(null); // Point reference

/*
	INTERNAL MARKER FUNCTIONS
 */

const checkMarkerSym = TangramReference.checkSymbolizer('markers');

/**
 * get colors from cartocss with the alpha channel applied
 * @param  {object} c3ss compiled carto css
 * @return {object}      draw object with color and border_color
 */

const getColor = getColorFn(
  getPropertyOrDefFn('fill', PR),
  getEitherProp('fill-opacity', 'opacity', PR)
);

const getOutlineColor = getColorFn(
  getPropertyFnSafe('stroke', PR),
  getEitherProp('stroke-opacity', 'opacity', PR)
);

const getColors = compose(
  pickBy(compose(not,isNil)),
  applySpec({
    color: getColor,
    outline: {
      color: getOutlineColor
    }
  })
);

/**
 * getWidth for the marker and his border
 * @param  {object} c3ss compiled carto css
 * @return {object}      size and border_width
 */

const getMarkerWidth = getPropertyFnSafe('width', PR);

const getOutlineWidth = getPropertyFnSafe('stroke-width', PR);

const getWidths = compose(
  pickBy(compose(not, isNil)),
  applySpec({
    size: getMarkerWidth,
    outline: {
      width: getOutlineWidth
    }
  })
);

/**
 * Get collide from allow-overlap in cartocss [NON-DYNAMIC]
 * @param  {object} c3ss compiled carto css
 * @return {object}      return draw object with a non-dynamic collide option
 */

const getCollide = getExecutedFn('allow-overlap', PR);


const getBlending = getBlendFn(PR);

/**
 * Basic point
 */

var Point = {};


/**
 * Get the draw (for tangram) object of a point from compiled carto css
 * @param  {object} c3ss compiled carto @class
 * @return {object}      object with the draw types and their properties
 */
Point.getDraw = function(c3ss, id) {
	var point = {},
      draw = {};

	if (checkMarkerSym(c3ss)) {

		point = mergeWith(
        merge,
				getWidths(c3ss),
				getColors(c3ss)
			);

    point.collide = !getCollide(c3ss);
	}

  draw['points_' + id] = point;

  return draw;
};

// TODO
/**
 * [getStyle description]
 * @param  {[type]} c3ss  [description]
 * @return {[type]}       [description]
 */
Point.getStyle = function(c3ss, id, ord) {
  let style = {};
  style['points_' + id] = {
    base: 'points',
    blend: 'overlay',
    blend_order: ord || 1
  };

	if (checkMarkerSym(c3ss)) {
    let p = style['points_' + id];
    p.blend = getBlending(c3ss);
	}

	return style;
};

module.exports = Point;
