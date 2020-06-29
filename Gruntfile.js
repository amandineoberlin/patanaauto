  'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    exec: {
      npm_install: {
        cwd: 'public/',
        command: 'npm i'
      },
      frontend_build: {
        cwd: 'public/',
        command: 'ng build --prod'
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.registerTask('installDeps', ['exec:npm_install', 'exec:frontend_build']);
  grunt.registerTask('default', 'installDeps');
};
