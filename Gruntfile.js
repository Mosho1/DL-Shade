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
        },

        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec',
                jUnit: {
                    report: true,
                    savePath : "./build/reports/jasmine/",
                    useDotNotation: true,
                    consolidate: true
                }
            },
            all: ['jasmine/spec/']
        }
    });

    //grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-jasmine-node');
    //grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['browserify']);
    grunt.registerTask('test', ['jasmine_node']);

};