// https://github.com/gruntjs/grunt-contrib-cssmin
module.exports = {
    options: {
        sourceMap: true
    },
    dist: {
        files: [{
            expand: true,
            cwd: '<%= paths.dist %>css',
            src: ['*.css', '!*.min.css'],
            dest: '<%= paths.dist %>css',
            ext: '.min.css'
        }]
    }
};
