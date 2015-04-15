var fs = require('fs');

module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);
  var _ = require('lodash');

  var karmaConfig = function (configFile, customOptions) {
    var options = {configFile : configFile, keepalive : true};
    var travisOptions = process.env.TRAVIS && {browsers : ['Firefox'], reporters : 'dots'};
    return _.extend(options, customOptions, travisOptions);
  };

  // Returns configuration for bower-install plugin
  var loadTestScopeConfigurations = function () {
    var scopes = fs.readdirSync('./test_scopes').filter(function (filename) {
      return typeof filename === 'string' && filename[0] !== '.';
    });
    var config = {
      options : {
        color : false,
        interactive : false
      }
    };
    // Create a sub config for each test scope
    for (var idx in scopes) {
      if (scopes.hasOwnProperty(idx)) {
        var scope = scopes[idx];
        config['test_scopes_' + scope] = {
          options : {
            cwd : 'test_scopes/' + scope,
            production : false
          }
        };
      }
    }
    return config;
  };

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    meta : {
      banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "name").join(", ") %> */'
    },
    clean : {
      dist : 'dist/',
      temp : 'temp/'
    },
    jshint : {
      all : ['Gruntfile.js', 'test/unit/*.js', 'src/**/*.js'],
      options : {
        esnext: true,
        eqeqeq : true,
        globals : {
          angular : true
        }
      }
    },
    coffee : {
      test : {
        options : {
          bare : true
        },
        expand : true,
        cwd : 'test/',
        src : ['unit/**/*.coffee'],
        dest : 'temp/test/',
        ext : '.js'
      }
    },
    babel : {
      options : {
        sourceMap : false
      },
      src : {
        expand : true,
        cwd : 'src/',
        src : ['**/*.js'],
        dest : 'temp/',
        ext : '.js'
      }
    },
    karma : {
      unit : {
        options : karmaConfig('karma.conf.js', {
          singleRun : true
        })
      },
      headless : {
        options : karmaConfig('karma.conf.js', {
          singleRun : true,
          browsers : ['PhantomJS']
        })
      },
      server : {
        options : karmaConfig('karma.conf.js', {
          singleRun : false
        })
      }
    },
    watch : {
      'test' : {
        files : ['test/**/*.coffee'],
        tasks : ['coffee:test']
      },
      scripts : {
        files : ['Gruntfile.js', 'temp/**/*.js', 'test/**/*.js'],
        tasks : ['karma:unit']
      }
    },
    browserify: {
      dist : {
        options: {
          browserifyOptions: {
            fullPaths: false,
            debug: true
          },
          transform: ['babelify', require('browserify-ngannotate')],
          banner : '<%= meta.banner %>',
          watch: true
        },
        files : {
          'dist/angular-vertxbus.js' : [
            'src/index.js'
          ]
        }
      }
    },
    extract_sourcemap: {
      dist: {
        files: {
          'dist': ['dist/angular-vertxbus.js']
        }
      }
    },
    uglify : {
      options : {
        preserveComments : 'some',
        sourceMap: true,
        sourceMapIn: 'dist/angular-vertxbus.js.map'
      },
      dist : {
        files : {
          'dist/angular-vertxbus.min.js' : 'dist/angular-vertxbus.js'
        }
      }
    },
    changelog : {
      options : {
        dest : 'CHANGELOG.md'
      }
    },

    'bower-install-simple' : loadTestScopeConfigurations()

  });

  // Compile and test (use "build" for dist/*)
  grunt.registerTask('default', [
    'clean',
    'coffee',
    'jshint',
    'karma:unit'
  ]);

  // Testing
  grunt.registerTask('test', [
    'clean',
    'coffee',
    'jshint',
    'karma:unit'
  ]);
  grunt.registerTask('install-test', [
    'bower-install-simple'
  ]);
  grunt.registerTask('test-server', [
    'karma:server'
  ]);

  // Building & releasing
  grunt.registerTask('build', [
    'clean',
    'coffee',
    'jshint',
    'karma:unit',
    'browserify',
    'extract_sourcemap',
    'uglify'
  ]);
  grunt.registerTask('release', [
    'changelog',
    'build'
  ]);
};
