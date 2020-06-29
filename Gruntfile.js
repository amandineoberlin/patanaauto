  'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    exec: {
      npm_install: {
        cwd: 'public/',
        command: 'npm i --production'
      },
      angular_cli_install: {
        cwd: 'public/',
        command: 'npm install -g angular-cli'
      },
      dev_build: {
        cwd: 'public/',
        command: 'ng build --prod'
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.registerTask('installProdDeps', [
    'exec:npm_install',
    'exec:angular_cli_install',
    'exec:dev_build']);
  grunt.registerTask('default', 'installProdDeps');
};
