// https://github.com/gruntjs/grunt-contrib-concat
module.exports = {
    dist: {
        files: {
            // '<%= paths.dist %>js/libs.js': '<%= files.vendor %>',
            '<%= paths.distJs %>mobile.js': '<%= files.js %>',
            '<%= paths.distJs %>main.js': '<%= paths.js %>main.js'
        }
    }
};
