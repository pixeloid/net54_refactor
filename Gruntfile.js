/* jshint node: true */
module.exports = function (grunt) {
	"use strict";

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
        clean: {dist: ['dist']},
        less: {
        	options: {
        		banner: '<%= banner %>',
        		metadata: 'src/*.{json,yml}',
				paths: [
					'bower_components/bootstrap/less', 
					'bower_components/eonasdan-bootstrap-datetimepicker/src/less',
					'bower_components/bootstrap-dialog/src/less',
					'bower_components/fuelux/less'],
				imports: {
					reference: ['mixins.less', 'variables.less']
				}
			},
			development: {
				files: {
					'dist/assets/css/main.css': ['src/assets/less/style.less']
				}
			},
			production: {
				options: {
					compress: true
				},
				files: {
					'dist/assets/css/main.min.css': ['src/assets/less/style.less']
				}
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: false
			},
			main: {
				src: [
					'src/assets/js/app/base.js', 
					'src/assets/js/app/formGeneral.js',
                    'src/assets/js/app/chart.js',
                    'src/assets/js/app/jqGrid.js',
				],
				dest: 'dist/assets/js/main.js'
			}
			//,
			// countdown: {
			// 	src: ['src/assets/js/countdown.js'],
			// 	dest: 'dist/assets/js/countdown.js'
			// },
			// styleSwitcher: {
			// 	src: ['src/assets/js/style-switcher.js'],
			// 	dest: 'dist/assets/js/style-switcher.js'
			// },
			// emberApp: {
			// 	src: ['src/assets/js/app.js'],
			// 	dest: 'dist/assets/js/app.js'
			// }
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			main: {
				src: ['<%= concat.main.dest %>'],
				dest: 'dist/assets/js/main.min.js'
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
            	assets: 'dist/assets',
            	data: 'src/data/*.{json,yml}',
            	partials: ['src/templates/partials/**/*.hbs'],
            	helpers: 'src/helper/**/*.js',
            	layoutdir: 'src/templates/layouts'
            },
            pages: {
                // Target-level options
                options: {
                	layout: 'default.hbs'
                },
                files: [
                {expand: true, cwd: 'src/templates/pages', src: ['*.hbs'], dest: 'dist/'}
                ]
            },
            theme: {
            	options: {
            		layout: 'theme.hbs'
            	},
            	files: [
            	{expand: true, cwd: 'src/templates/elements', src: ['*.hbs'], dest: 'dist/'}
            	]
            },
            login: {
            	options: {
            		layout: 'login.hbs'
            	},
            	files: [
            	{expand: true, cwd: 'src/templates/login', src: ['login.hbs'], dest: 'dist/'}
            	]
            },
            errors: {
            	options: {
            		layout: 'errors.hbs'
            	},
            	files: [
            	{expand: true, cwd: 'src/templates/errors', src: ['*.hbs'], dest: 'dist/'}
            	]
            },
            countdown: {
            	options: {
            		layout: 'countdown.hbs'
            	},
            	files: [
            		{expand: true, cwd: 'src/templates/countdown', src: ['*.hbs'], dest: 'dist/'}
            	]
            }
        },
        copy: {
        	main: {
        		files: [
        		{
        			expand: true,
        			cwd: 'src/assets/css',
        			src: ['./**/*.*'],
        			dest: 'dist/assets/css'
        		},
        		{
        			expand: true,
        			cwd: 'src/assets/lib',
        			src: ['./**/*.*'],
        			dest: 'dist/assets/lib'
        		},
        		{
        			expand: true,
        			cwd: 'src/assets/fonts',
        			src: ['./**/*.*'],
        			dest: 'dist/assets/fonts'
        		},
        		{
        			expand: true,
        			cwd: 'src/assets/img',
        			src: ['./**/*.*'],
        			dest: 'dist/assets/img'
        		},
        		// {
        		// 	expand: true,
        		// 	cwd: 'src/assets/submodule',
        		// 	src: ['./**/*.*'],
        		// 	dest: 'dist/assets/lib'
        		// },
        		// {
        		// 	expand: true,
        		// 	cwd: 'src/ember',
        		// 	src: ['*.html'],
        		// 	dest: 'dist'
        		// },
        		// {
        		// 	expand: true,
        		// 	cwd: 'node_modules/assemble-less/node_modules/less/dist/',
        		// 	src: ['less-1.7.0.min.js'],
        		// 	dest: 'dist/assets/lib'
        		// },
        		{
        			expand: true,
        			cwd: 'bower_components/jquery/dist',
        			src: ['./*.*'],
        			dest: 'dist/assets/lib/jquery'
        		},
                {
                    expand: true,
                    cwd: 'bower_components/bootstrap/fonts/',
                    src: ['./**/*.*'],
                    dest: 'dist/assets/fonts'
                },
                {
                    expand: true,
                    cwd: 'bower_components/bootstrap/dist/',
                    src: ['./**/*.*'],
                    dest: 'dist/assets/lib/bootstrap'
                },
				{
					expand: true,
					cwd: 'bower_components/bootstrap-dialog/dist/js',
					src: ['./**/*.*'],
					dest: 'dist/assets/lib/bootstrap-dialog/'
				},
				{
					expand: true,
					cwd: 'bower_components/eonasdan-bootstrap-datetimepicker/build/js',
					src: ['./**/*.*'],
					dest: 'dist/assets/lib/eonasdan-bootstrap-datetimepicker'
				},
				{
					expand: true,
					cwd: 'bower_components/fuelux/dist',
					src: ['./**/*.*'],
					dest: 'dist/assets/lib/fuelux'
				},
        		{
        			expand: true,
        			cwd: 'bower_components/font-awesome/',
        			src: ['./css/*.*', './fonts/*.*'],
        			dest: 'dist/assets/lib/Font-Awesome'
        		},
        		{
        			expand: true,
        			cwd: 'bower_components/iCheck/',
        			src: ['./**'],
        			dest: 'dist/assets/lib/icheck'
        		},
        		{
        			expand: true,
        			cwd: 'bower_components/flot/',
        			src: ['./jquery.*.js'],
        			dest: 'dist/assets/lib/flot'
        		},
        		{
        			expand: true,
        			cwd: 'bower_components/html5shiv/dist',
        			src: ['./html5shiv.js'],
        			dest: 'dist/assets/lib/html5shiv'
        		},
        		{
        			expand: true,
        			cwd: 'bower_components/respond/dest',
        			src: ['./respond.min.js'],
        			dest: 'dist/assets/lib/respond'
        		},
                {
                    expand: true,
                    cwd: 'bower_components/modernizr',
                    src: ['./modernizr.js'],
                    dest: 'dist/assets/lib/modernizr'
                },
                {
                    expand: true,
                    cwd: 'bower_components/jqgrid/js/minified',
                    src: ['./**/*'],
                    dest: 'dist/assets/lib/jqgrid'
                },
                {
                    expand: true,
                    cwd: 'bower_components/jscrollpane/script',
                    src: ['./**/*'],
                    dest: 'dist/assets/lib/jscrollpane'
                },
        		// {
        		// 	expand: true,
        		// 	cwd: 'src/assets/less',
        		// 	src: ['./**/theme.less'],
        		// 	dest: 'dist/assets/less'
        		// },
        		// {
        		// 	expand: true,
        		// 	cwd: 'node_modules/epiceditor/epiceditor',
        		// 	src: ['./**/*.*'],
        		// 	dest: 'dist/assets/lib/epiceditor'
        		// },
        		// {
        		// 	expand: true,
        		// 	cwd: 'node_modules/screenfull/dist/',
        		// 	src: ['./**/*.*'],
        		// 	dest: 'dist/assets/lib/screenfull/'
        		// }
        		]
        	}
        },

        watch: {
		   	options: { livereload: true },

			scripts: {
        		files: ['src/assets/**/*.js'],
        		tasks: ['dist-js']
        	},
        	less: {
				files: ['src/assets/**/*.less'],
        		tasks: ['less'],
			},
        	assemble: {
        		files: ['src/templates/**/*.hbs'],
        		tasks: ['assemble:theme']
        	}
        },


        connect: {
        	all: {
        		options:{
        			port: 8001,
        			hostname: "0.0.0.0",
        			path: 'dist'
        		}
        	}
        },

        open: {
        	all: {
        	    // Gets the port from the connect configuration
        	    path: 'http://<%= connect.all.options.hostname%>:<%= connect.all.options.port%>/dist/elements.html'
        	}
        },


	});



    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('assemble-less');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');


    //grunt.loadNpmTasks('grunt-recess');
    // remove grunt-recess modules. because not supported my code

    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');

    // Test task.
    //grunt.registerTask('test', ['jshint', 'qunit']);

    // JS distribution task.
    grunt.registerTask('dist-js', ['concat', 'jshint', 'uglify']);

    
    // Full distribution task.
    grunt.registerTask('dist', ['clean', 'copy', 'less:development', 'less:production', 'dist-js', 'assemble:theme']);

    // Default task.
    //grunt.registerTask('default', ['test', 'dist']);

    grunt.registerTask('default', ['dist']);

    grunt.registerTask('server',['connect','open', 'watch']);


};
