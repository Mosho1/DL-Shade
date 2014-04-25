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
            options: {
                separator: ';'
            },
            set1: {
                src: ['public/scripts/Shade/shade_module.js', 'public/scripts/Shade/controllers/*.js', 'public/scripts/Shade/directives/*.js',
                    'public/scripts/Shade/factories/*.js', 'public/scripts/Shade/filters/*.js', 'public/scripts/Shade/services/*.js'],
                dest: 'public/dist/js/shade-module.js'
            },
            set2: {
                src: ['public/scripts/Editor/app.js', 'public/scripts/Editor/controllers/*.js', 'public/scripts/Editor/directives/*.js',
                    'public/scripts/Editor/factories/*.js', 'public/scripts/Editor/filters/*.js', 'public/scripts/Editor/services/*.js'],
                dest: 'public/dist/js/editor-module.js'
            },
            set3: {
                src: ['public/DL_libs/jquery-2.1.0.min.js',
                    'public/DL_libs/angular.js',
                    'public/DL_libs/lodash.js',
                    'public/DL_libs/markdown.js',
                    'public/DL_libs/angular-resource.min.js',
                    'public/DL_libs/angular-cookies.min.js',
                    'public/DL_libs/angular-sanitize.min.js',
                    'public/DL_libs/angular-animate.min.js',
                    'public/DL_libs/google-code-prettify/src/prettify.js',
                    'public/DL_libs/d3.v2.js',
                    'public/DL_libs/xml2json.min.js',
                    'public/DL_libs/markdown.min.js',
                    'public/DL_libs/ui-bootstrap-tpls-0.10.0.js',
                    'public/DL_libs/bootstrap/js/bootstrap.js',
                    'public/DL_libs/ng-grid/ng-grid-2.0.7.debug.js',
                    'public/DL_libs/jquery.dataTables.min.js',
                    'public/DL_libs/ng-popover/tooltip.js',
                    'public/DL_libs/ng-popover/popover.js',
                    'public/DL_libs/ng-popover/dimensions.js'],

                dest: 'public/dist/js/libs.js'
            },
            set4: {
                src: ['public/dist/js/graph-text-dev.js', 'public/dist/js/shade-compiler.js', 'public/dist/js/shade-module.js', 'public/dist/js/editor-module.js'],
                dest: 'public/dist/js/script.js'

            }

        },

        uglify: {
            set1: {
                options: {
                    sourceMap: true
                },
                files: {
                    'public/dist/libs.min.js': ['public/dist/js/libs.js']
                }
            },
            set2: {
                options: {
                    sourceMap: true,
                    mangle: false
                },
                files: {
                    'public/dist/script.min.js': ['public/dist/js/script.js']
                }
            }
        },

        docco: {
            all: {
                src: ['public/scripts/graph-dev/*.js', 'public/scripts/Shade/**/*.coffee', 'public/scripts/Editor/**/*.coffee']
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
            },
            concat3: {
                files: ['<%= concat.set3.src %>'],
                tasks: ['concat:set3']
            },
            concat4: {
                files: ['<%= concat.set4.src %>'],
                tasks: ['concat:set4']
            },
            uglify1: {
                files: ['public/dist/js/libs.js'],
                tasks: ['uglify:set1']
            },
            uglify2: {
                files: ['public/dist/js/script.js'],
                tasks: ['uglify:set2']
            },
            docco: {
                files: ['<%= docco.all.src %>'],
                tasks: ['newer:docco:all']
            },


        },
        concurrent: {
            options: {
                logConcurrentOutput: true,
                limit: 8
            },
            watch: ['watch:browserify1', 'watch:browserify2', 'watch:concat1', 'watch:concat2', 'watch:concat3', 'watch:concat4']
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
        },
        karma: {
            unit: {
                configFile: 'jasmine/karma-unit.js',
                // run karma in the background
                background: true,
                // which browsers to run the tests on
                browsers: ['Chrome', 'Firefox']
            }
        },
        express: {
            options: {
                background: false,
                port: 3000
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-docco-multi');

    grunt.registerTask('default', ['browserify', 'concat']);
    grunt.registerTask('mini', ['uglify']);
    grunt.registerTask('all', ['default', 'mini']);
    grunt.registerTask('test', ['jasmine_node']);
    grunt.registerTask('watchall', ['concurrent:watch']);
    grunt.registerTask('serve', ['default', 'express:dev']);
    grunt.registerTask('docs', ['docco:all']);

};