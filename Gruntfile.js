  'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    exec: {
      build_frontend: {
        cwd: 'public/',
        command: 'npm i && npm run build --prod'
      },
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.registerTask('installDeps', ['exec:build_frontend']);
  grunt.registerTask('default', 'installDeps');
};
