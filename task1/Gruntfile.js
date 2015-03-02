module.exports = function(grunt) {

  grunt.initConfig({
    forever: {
  server: {
    options: {
      index: 'fileServer.js'
    }
  }
  }
  });

grunt.loadNpmTasks('grunt-forever');
};
