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
        tasks: ['shell:font', 'copy:font']
    },
    image: {
        files: ['<%= paths.img %>**/*'],
        tasks: ['newer:copy:dist'],
    },
    sass: {
        files: ['<%= paths.scss %>**/*.scss'],
        tasks: ['sass', 'newer:postcss', 'newer:cssmin']
    },
    js: {
        files: ['<%= paths.vendor %>**/*.js', '<%= paths.js %>**/*.js'],
        tasks: ['newer:copy:vendor', 'newer:concat', 'newer:uglify']
    }
};
