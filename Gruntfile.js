  'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    exec: {
      npm_install: {
        cwd: 'public/',
        command: 'npm i'
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.registerTask('installDeps', ['exec:npm_install']);
  grunt.registerTask('default', 'installDeps');
};
