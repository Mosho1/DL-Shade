module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            set1: {
                files: {
                    'public/scripts/Shade/dist/shadeCompiler.js': 'public/scripts/Shade/shadeCompiler/shadeHandlers.js'

                }
            },
            set2: {
                files: {
                    'public/scripts/graph-dev/dist/graph-text-dev.js': 'public/scripts/graph-dev/graph-text.js',

                }
            }
        },

        concat: {
            dist: {
                src: ['public/scripts/Shade/shade_module.js', 'public/scripts/Shade/controllers/*.js', 'public/scripts/Shade/directives/*.js',
                      'public/scripts/Shade/factories/*.js', 'public/scripts/Shade/filters/*.js', 'public/scripts/Shade/services/*.js'],
                dest: 'public/scripts/Shade/dist/shade_module.js'
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
                files: ['<%= concat.dist.src %>'],
                tasks: ['concat']
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            watch: ['watch:browserify1', 'watch:browserify2', 'watch:concat1']
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