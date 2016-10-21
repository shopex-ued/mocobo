// https://github.com/gruntjs/grunt-contrib-watch
module.exports = {
    grunt: {
        files: ['<%= files.grunt %>'],
        options: {
            reload: true
        }
    },
    font: {
        files: ['<%= paths.icons %>**/*.svg'],
        tasks: ['shell:font']
    },
    image: {
        files: ['<%= paths.distImg %>**/*'],
        tasks: ['newer:imagemin'],
    },
    sass: {
        files: ['<%= paths.scss %>**/*.scss'],
        tasks: ['sass', 'newer:postcss', 'newer:cssmin']
    },
    js: {
        files: ['<%= paths.vendor %>**/*.js', '<%= paths.js %>**/*.js'],
        tasks: ['newer:concat', 'newer:uglify']
    },
    vendor: {
        files: ['<%= paths.vendor %>**/*.js'],
        tasks: ['newer:copy:vendor']
    }
};
