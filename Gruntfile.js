  'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      npm_install: {
        cwd: 'public/',
        command: 'npm i --production'
      },
      npm_install_dev_dep: {
        cwd: 'public/',
        command: 'npm install --only=dev'
      },
      angular_cli_install: {
        cwd: 'public/',
        command: 'npm install -g @angular/cli@8.3.5'
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
    'exec:npm_install_dev_dep',
    'exec:angular_cli_install',
    'exec:dev_build']);
  grunt.registerTask('default', 'installProdDeps');
};
