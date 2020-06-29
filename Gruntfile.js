  'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    exec: {
      npm_install: {
        cwd: 'public/',
        command: 'npm i --production'
      },
      frontend_build: {
        cwd: 'public/',
        command: 'ng build --prod'
      },
      dev_build: {
        cwd: 'public/',
        command: 'npm install --only=dev'
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.registerTask('installProdDeps', [
    'exec:npm_install',
    'exec:frontend_build',
    'exec:dev_build']);
  grunt.registerTask('default', 'installProdDeps');
};
