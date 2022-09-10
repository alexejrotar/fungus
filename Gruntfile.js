module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/*.js', 'data/*.js'],
        dest: '<%= pkg.name %>.js'
      }
    },
    terser: {
      dist: {
        files: {
          'dist/<%= concat.dist.dest %>': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/*.js'],
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
        src: ['src/*.js']
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,

        },
        files: {
          'dist/index.html': 'index.html'
        },
      }
    },
    cssmin: {
      dist: {
        files: {
          'dist/css/main.css': 'css/main.css'
        }
      }
    },
    zip: {
      'submission.zip': ['dist/*.html', 'dist/*.js', 'dist/css/*.css'],
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-prettier')
  grunt.loadNpmTasks('grunt-terser')
  grunt.loadNpmTasks('grunt-contrib-htmlmin')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-zip')

  grunt.registerTask('default', ['prettier', 'jshint', 'concat', 'terser', 'htmlmin', 'cssmin', 'zip'])
}