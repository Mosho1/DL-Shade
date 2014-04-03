module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            set1: {
                files: {
                    'public/dist/js/shade-compiler.js': 'public/scripts/Shade/shadeCompiler/shadeHandlers.js'
                }
            },
            set2: {
                files: {
                    'public/dist/js/graph-text-dev.js': 'public/scripts/graph-dev/graph-text.js'
                }
            }
        },
        concat: {
            set1: {
                src: ['public/scripts/Shade/shade_module.js', 'public/scripts/Shade/controllers/*.js', 'public/scripts/Shade/directives/*.js',
                      'public/scripts/Shade/factories/*.js', 'public/scripts/Shade/filters/*.js', 'public/scripts/Shade/services/*.js'],
                dest: 'public/dist/js/shade-module.js'
            },
            set2: {
                src: ['public/scripts/Editor/app.js', 'public/scripts/Editor/controllers/*.js', 'public/scripts/Editor/directives/*.js',
                    'public/scripts/Editor/factories/*.js', 'public/scripts/Editor/filters/*.js', 'public/scripts/Editor/services/*.js'],
                dest: 'public/dist/js/editor-module.js'
            }
        },
        watch: {
            browserify1: {
                files: ['public/scripts/Shade/shadeCompiler/*.js'],
                tasks: ['browserify:set1']
            },
            browserify2: {
                files: ['public/scripts/graph-dev/*.js'],
                tasks: ['browserify:set2']
            },
            concat1: {
                files: ['<%= concat.set1.src %>'],
                tasks: ['concat:set1']
            },
            concat2: {
                files: ['<%= concat.set2.src %>'],
                tasks: ['concat:set2']
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            watch: ['watch:browserify1', 'watch:browserify2', 'watch:concat1', 'watch:concat2']
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
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('default', ['browserify', 'concat']);
    grunt.registerTask('test', ['jasmine_node']);
    grunt.registerTask('conc-watch', ['concurrent:watch']);

};