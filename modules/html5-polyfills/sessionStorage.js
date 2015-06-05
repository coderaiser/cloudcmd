if (!sessionStorage && JSON) {
  sessionStorage = (function () {
    var data = window.name ? JSON.parse(window.name) : {};

    return {
      clear: function () {
        data = {};
        window.name = '';
      },
      getItem: function (key) {
        return data[key] === undefined ? null : data[key];
      },
      removeItem: function (key) {
        delete data[key];
        window.name = JSON.stringify(data);
      },
      setItem: function (key, value) {
        data[key] = value;
        window.name = JSON.stringify(data);
      }
    };
  })();
}
