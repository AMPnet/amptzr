(function (window) {
  window.env = window.env || {};

  // postbuild-time environment variables
  window.env.ARKANE_ID = '${ARKANE_ID}';
  window.env.ARKANE_ENV = '${ARKANE_ENV}';
  window.env.FIXED_CHAIN_ID = '${FIXED_CHAIN_ID}';
})(this);
