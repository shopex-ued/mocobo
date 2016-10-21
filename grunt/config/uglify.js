// https://github.com/gruntjs/grunt-contrib-uglify
module.exports = {
    options: {
        report: 'min',
        sourceMap: true,
        preserveComments: false
    },
    dist: {
        files: {
            '<%= paths.distJs %>libs.min.js': ['<%= files.vendor %>'],
            '<%= paths.distJs %>mobile.min.js': ['<%= files.js %>'],
            '<%= paths.distJs %>main.min.js': ['<%= paths.js %>main.js']
        }
    }
};
