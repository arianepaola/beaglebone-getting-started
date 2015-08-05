module.exports = function(grunt) {

    var appSources = ['App/*.js', 'test/**/*.js'];

    grunt.initConfig({
        appFiles: ['./App/**', '!./App/templates/**', './Docs/**', './README.htm'],
        appSources: appSources,
        jsSources: appSources.slice().concat('Gruntfile.js'),
        jsTests: ['test/**/*.js'],

        nodewebkit: {
            options: {
                version: '0.12.3',
                buildDir: './build',
                macIcns: './App/beaglebone-getting-started.icns',
                platforms: ['win', 'osx', 'linux'] // builds both 32 and 64 bit versions
            },
            src: '<%= appFiles %>'
        },

        jade: {
            compile: {
                options: {
                    data: {
                        debug: false,
                        timestamp: '<%= new Date().getTime() %>'
                    },
                    i18n: {
                        locales: 'App/i18n/**/*.json',
                        namespace: '$i18n'
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'App/templates',
                        src: ['**/*.jade'],
                        dest: 'App/html',
                        ext: '.html'
                    },
                ]
            }
        },

        remotefile: {
            "jquery": {
                url:'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
                dest:'App/js/libs/jquery.min.js'
            },
            "bootstrap-js": {
                url:'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js',
                dest:'App/js/libs/bootstrap.min.js'
            },
            "font-awesome": {
                url:'http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css',
                dest:'App/css/libs/font-awesome.min.css'
            },
            "bootstrap-pingendo-theme": {
                url:'http://pingendo.github.io/pingendo-bootstrap/themes/default/bootstrap.css',
                dest:'App/css/libs/bootstrap.css'
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: '<%= jsTests %>'
            }
        },

        mocha_istanbul: {
            coverage: {
                src: '<%= appSources %>',
                options: {
                    mask: '*.js'
                }
            }
        },

        jshint: {
            files: '<%= jsSources %>',
            options: {
                globals: {
                    node: true,
                    jQuery: true
                }
            }
        },

        jscs: {
            src: '<%= jsSources %>',
            options: {
                config: ".jscsrc"
            }
        }
    });

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-jade-i18n');
    grunt.loadNpmTasks('grunt-remotefile');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');

    grunt.registerTask('getdependencies', ['remotefile']);
    grunt.registerTask('make_html', ['jade']);
    grunt.registerTask('make_package', ['nodewebkit']);
    grunt.registerTask('build', ['remotefile', 'jade', 'nodewebkit']);
    grunt.registerTask('test', ['mochaTest', 'jshint', 'jscs', 'mocha_istanbul:coverage']);

};
