// https://github.com/gruntjs/grunt-sass
module.exports = {
    dist: {
        options: {
            includePaths: ['<%= paths.sassLoad %>'],
            outputStyle: 'expanded',
            indentWidth: 4,
            sourceMap: false,
            precision: 6,
            update: true,
            bundleExec: true
        },
        files: {
            '<%= paths.css %>mobile.css': '<%= files.scss %>',
            '<%= paths.css %>main.css': '<%= paths.scss %>main.scss'
        }
    }
};
