(function (global) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) module.exports = Smalltalk();else global.smalltalk = Smalltalk();

    function Smalltalk() {
        if (!(this instanceof Smalltalk)) return new Smalltalk();

        this.alert = function (title, message) {
            var promise = new Promise(function (resolve) {
                alert(message);
                resolve();
            });

            return promise;
        };

        this.prompt = function (title, message, value, options) {
            var o = options,
                promise = new Promise(function (resolve, reject) {
                var noCancel = o && !o.cancel,
                    result = prompt(message, value);

                if (result !== null) resolve(result);else if (!noCancel) reject();
            });

            return promise;
        };

        this.confirm = function (title, message, options) {
            var o = options,
                noCancel = o && !o.noCancel,
                promise = new Promise(function (resolve, reject) {
                var is = confirm(message);

                if (is) resolve();else if (!noCancel) reject();
            });

            return promise;
        };
    }
})(typeof window !== 'undefined' && window);