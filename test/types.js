'use strict';

function Mine(_a, _b) {
  this.a = _a;
  this.b = _b;
}

Mine.prototype.fn = function () {
  return a.toString() + ' ' + b.toString();
};

function Theirs(_mine) {
  this.mine = _mine;
}

Theirs.prototype.getMine = function () {
  return this.mine.fn();
};

var Other = (function () {
  return {
    create: function (theirs, arr) {
      return {
        theirs: theirs,
        arr: arr
      }
    }
  };
})();

function Singleton() {
  Singleton.prototype.value = Singleton.prototype.value + 1;
}

Singleton.prototype.value = 0;

module.exports = {
  Mine: Mine,
  Theirs: Theirs,
  Other: Other,
  Singleton: Singleton
};
