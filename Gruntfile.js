/* jshint node: true */
module.exports = function (grunt) {
	"use strict";



    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('assemble');


    // Project configuration.
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        banner: '/**\n' +
        '* <%=pkg.name %> v<%= pkg.version %>\n' +
        '* Author : <%= pkg.author.name %> \n' +
        '* Copyright <%= grunt.template.today("yyyy") %>\n' +
        '* Licensed under <%= pkg.licenses %>\n' +
        '*/\n',

        config: {
          src: 'src',
          tmp: 'tmp',
          dist: 'dist'
        },
        clean: {
            dev: ['<%= config.tmp %>'],
            dist: ['<%= config.dist %>']
        },
        less: {
        	options: {
        		banner: '<%= banner %>',
				paths: [
					'bower_components/bootstrap/less', 
					'bower_components/eonasdan-bootstrap-datetimepicker/src/less',
					'bower_components/bootstrap-dialog/src/less',
					'bower_components/fuelux/less'],
				imports: {
					reference: ['mixins.less', 'variables.less']
				}
			},
			dev: {
                files:{
                    '<%= config.tmp %>/assets/css/main.css': '<%= config.src %>/assets/less/style.less'
                }
			},
			dist: {
				options: {
					compress: true
				},
                files:{
                    '<%= config.dist %>/assets/css/main.min.css': '<%= config.src %>/assets/less/style.less'
                }
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: false
			},
            lib: {
                src: [
                    'bower_components/modernizr/modernizr.js',
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'bower_components/moment/moment.js',
                    'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                    'bower_components/bootstrap-dialog/dist/js/bootstrap-dialog.min.js',
                    'bower_components/fuelux/js/dropdown-autoflip.js',
                    'bower_components/fuelux/js/pillbox.js',
                    'bower_components/iCheck/icheck.min.js',
                    'bower_components/jqgrid/js/minified/i18n/grid.locale-hu.js',
                    'bower_components/jqgrid/js/minified/jquery.jqGrid.min.js',
                    'bower_components/jscrollpane/script/jquery.jscrollpane.min.js',
                    'bower_components/jscrollpane/script/jquery.mousewheel.js',
                    'bower_components/jscrollpane/script/mwheelIntent.js',
                    'bower_components/flot/jquery.flot.js',
                    'bower_components/flot/jquery.flot.pie.js',
                    'bower_components/flot/jquery.flot.threshold.js',
                    'bower_components/flot/jquery.flot.selection.js',
                    'bower_components/flot/jquery.flot.resize.js',
                    'bower_components/flot/jquery.flot.stack.js',
					'bower_components/reconnectingWebsocket/reconnecting-websocket.min.js',
                    'bower_components/flot.tooltip/js/jquery.flot.tooltip.js'
                ],
                dest: '<%= config.tmp %>/assets/js/lib.js'
            },
			general: {
				src: [
					'<%= config.src %>/assets/js/app/formGeneral.js',
					'<%= config.src %>/assets/js/app/jqGrid-config.js',
					'<%= config.src %>/assets/js/app/jqGrid-net54.js',
					'<%= config.src %>/assets/js/app/dom-utils.js',
					'<%= config.src %>/assets/js/app/bootstrap-utils.js'
				],
				dest: '<%= config.tmp %>/assets/js/general.js'
			},
			app: {
				src: [
                    '<%= config.src %>/assets/js/app/chart.js',
                    '<%= config.src %>/assets/js/app/jqGrid.js',
                    '<%= config.src %>/assets/js/app/base.js', 
				],
				dest: '<%= config.tmp %>/assets/js/app.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>',
				sourceMap: true
			},
			lib: {
				src: ['<%= concat.lib.dest %>'],
				dest: 'dist/assets/js/lib.min.js'
			},
			general: {
				src: ['<%= concat.general.dest %>'],
				dest: 'dist/assets/js/general.min.js'
			},
			app: {
				src: ['<%= concat.app.dest %>'],
				dest: 'dist/assets/js/app.min.js'
			}
		},
		jshint: {
			options: {
				jshintrc: 'src/assets/js/.jshintrc'
			},
			main: {
				src: ['src/assets/js/*.js']
			}
		},
		assemble: {
	            // Task-level options
            options: {
            	flatten: true,
            	postprocess: require('pretty'),
            	//assets: 'dist/assets',
            	data: 'src/data/*.{json,yml}',
            	partials: ['src/templates/partials/**/*.hbs'],
            	helpers: 'src/helper/**/*.js',
            	layoutdir: 'src/templates/layouts',
                layout: 'theme.hbs'
            },
            dev: {
            	files: [
            	{
                    expand: true, 
                    cwd: 'src/templates/elements', 
                    src: ['*.hbs'], 
                    dest: '<%= config.tmp %>/'
                }
            	]
            },
        },
        copy: {
        	dev: {
        		files: [
                    {
                        expand: true,
                        cwd: '<%= config.src %>/assets/img/',
                        src: ['**'],
                        dest: '<%= config.tmp %>/assets/img'

                    },
                    {
                        expand: true,
                        cwd: 'src/assets/img',
                        src: ['./**/*.*'],
                        dest: 'tmp/assets/img'
                    },
            		{
            			expand: true,
            			cwd: 'src',
            			src: ['./.htaccess'],
            			dest: 'tmp'
            		},

                    {
                        expand: true,
                        cwd: 'bower_components/bootstrap/fonts/',
                        src: ['./**/*.*'],
                        dest: 'tmp/assets/fonts/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/font-awesome/',
                        src: ['./css/*.*', './fonts/*.*'],
                        dest: 'tmp/assets/fonts'
                    },
            		{
            			expand: true,
            			cwd: 'bower_components/entypo/font',
            			src: ['entypo.*'],
            			dest: 'tmp/assets/fonts'
            		},
            		{
            			expand: true,
            			cwd: 'bower_components/html5shiv/dist',
            			src: ['./html5shiv.min.js'],
            			dest: 'tmp/assets/js'
            		},
                    {
                        expand: true,
                        cwd: 'bower_components/respond/dest',
                        src: ['./respond.min.js'],
                        dest: 'tmp/assets/js'
                    },
            		{
            			expand: true,
            			cwd: 'bower_components/jquery/dist',
            			src: ['./jquery.min.map'],
            			dest: 'tmp/assets/js'
            		}
                ]
        	},

            dist: {
                files: [
                  {
                    expand: true,
                    cwd: '<%= config.tmp %>',
                    src: ['**'],
                    dest: '<%= config.dist %>'
                  }
                ]

            }
        },

        watch: {

			concat: {
        		files: ['src/assets/**/*.js'],
        		tasks: ['concat']
        	},
        	less: {
				files: ['src/assets/**/*.less'],
        		tasks: ['less:dev'],
			},
        	assemble: {
        		files: ['src/templates/**/*.hbs'],
        		tasks: ['assemble:dev']
        	},

            livereload: {
              options: {
                livereload: '<%= connect.options.livereload %>'
              },
              files: [
                '<%= config.tmp %>/{,*/}*.html',
                '<%= config.tmp %>/assets/css/{,*/}*.css',
                '<%= config.tmp %>/assets/js/{,*/}*.js',
                '<%= config.tmp %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
              ]
            }

        },


        connect: {
          options: {
            port: 9000,
            livereload: 35729,
            // change this to '0.0.0.0' to access the server from outside
            hostname: 'localhost'
          },
          livereload: {
            options: {
              open: true,
              base: [
                '<%= config.tmp %>'
              ]
            }
          }
        },

        ftpush: {
            build: {

                auth: {
                    host: "pixeloid.hu",
                    port: 21,
                    authKey: 'key1'
                },
                src: 'dist',
                dest: '/htdocs'
            }
        }
	});



    // These plugins provide necessary tasks.
    // grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('assemble-less');
    // grunt.loadNpmTasks('grunt-ftpush');
    // grunt.loadNpmTasks('grunt-contrib-watch');


    // //grunt.loadNpmTasks('grunt-recess');
    // // remove grunt-recess modules. because not supported my code

    // grunt.loadNpmTasks('assemble');
    // grunt.loadNpmTasks('grunt-contrib-connect');
    // grunt.loadNpmTasks('grunt-open');

    // Test task.
    //grunt.registerTask('test', ['jshint', 'qunit']);

    // JS distribution task.
    grunt.registerTask('dev', ['clean:dev', 'copy:dev', 'less:dev', 'concat', 'uglify', 'assemble', 'copy']);
	grunt.registerTask('default', ['dev']);
    grunt.registerTask('server', ['dev', 'connect:livereload', 'watch']);
   

   grunt.registerTask('build', [
     'dev',
     'clean:dist',
     'assemble',
     'copy:dist',
     'less:dist',
     'ftpush'
   ]);
 // grunt.registerTask('dist-js', ['concat', 'jshint', 'uglify']);

    
    // // Full distribution task.
    // grunt.registerTask('dist', ['clean', 'copy', 'less:development', 'less:production', 'dist-js', 'assemble:theme', 'ftpush']);

    // // Default task.
    // //grunt.registerTask('default', ['test', 'dist']);

    // grunt.registerTask('default', ['dist']);

    // grunt.registerTask('server',['connect','open', 'watch']);


};
