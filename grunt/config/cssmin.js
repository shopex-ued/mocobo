// https://github.com/gruntjs/grunt-contrib-cssmin
module.exports = {
    options: {
        sourceMap: true
    },
    dist: {
        files: [{
            expand: true,
            cwd: '<%= paths.css %>',
            src: ['*.css', '!*.min.css'],
            dest: '<%= paths.css %>',
            ext: '.min.css'
        }]
    }
};
