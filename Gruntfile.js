module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      game: {
        src: ['src/*.js', 'data/*.js'],
        dest: '<%= pkg.name %>.js'
      }
    },
    terser: {
      game: {
        files: {
          'public/<%= concat.game.dest %>': ['<%= concat.game.dest %>']
        }
      },
      editor: {
        files: {
          'public/editor/editor.js': ['editor/editor.js'],
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/*.js', 'editor/*.js'],
      options: {
        globals: {
          console: true,
          document: true,
        },
        asi: true,
        esversion: 11
      }
    },
    prettier: {
      options: {
        progress: true
      },
      files: {
        src: ['src/*.js', 'editor/*.js']
      }
    },
    htmlmin: {
      game: {
        options: {
          collapseWhitespace: true,
        },
        files: {
          'public/index.html': 'index.html'
        },
      },
      editor: {
        options: {
          collapseWhitespace: true,
        },
        files: {
          'public/editor/index.html': 'editor/index.html',
        }
      }
    },
    cssmin: {
      game: {
        files: {
          'public/css/main.css': 'css/main.css'
        }
      },
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'data/*.js', 'css/*.css', 'index.html'],
        tasks: ['concat', 'terser', 'htmlmin', 'cssmin'],
        options: {
          spawn: false,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-prettier')
  grunt.loadNpmTasks('grunt-terser')
  grunt.loadNpmTasks('grunt-contrib-htmlmin')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('base', ['prettier', 'jshint'])
  grunt.registerTask('editor', ['terser:editor', 'htmlmin:editor'])
  grunt.registerTask('game', ['concat', 'terser:game', 'htmlmin:game', 'cssmin:game'])
  grunt.registerTask('build', ['base', 'game', 'editor'])
}