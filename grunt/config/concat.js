// https://github.com/gruntjs/grunt-contrib-concat
module.exports = {
    dist: {
        files: {
            // '<%= paths.dist %>js/libs.js': '<%= files.vendor %>',
            '<%= paths.dist %>js/mobile.js': '<%= files.js %>',
            '<%= paths.dist %>js/main.js': '<%= paths.js %>main.js'
        }
    }
};
