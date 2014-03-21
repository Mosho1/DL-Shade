module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'public/scripts/graph-dev/dist/graph-text-dev.js': 'public/scripts/graph-dev/graph-text.js',
                    'public/scripts/services/shadeServices/dist/shadeServices.js': 'public/scripts/services/shadeServices/shadeHandlers.js'

                }
            }
        },

        watch: {
            files: ['public/scripts/graph-dev/*.js', 'public/scripts/services/shadeServices/*.js'],
            tasks: ['browserify']
        }
    });

    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    //grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['browserify']);

};