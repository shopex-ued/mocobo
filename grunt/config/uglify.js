// https://github.com/gruntjs/grunt-contrib-uglify
module.exports = {
    options: {
        sourceMap: true,
        preserveComments: false
    },
    dist: {
        files: {
            '<%= paths.dist %>js/libs.min.js': ['<%= files.vendor %>'],
            '<%= paths.dist %>js/mobile.min.js': ['<%= files.js %>'],
            '<%= paths.dist %>js/main.min.js': ['<%= paths.src %>js/main.js']
        }
    }
};
