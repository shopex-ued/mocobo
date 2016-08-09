// https://github.com/gruntjs/grunt-sass
module.exports = {
    dist: {
        options: {
            includePaths: ['<%= paths.sassLoad %>'],
            outputStyle: 'expanded',
            indentWidth: 4,
            sourceMap: false,
            precision: 5,
            update: true,
            bundleExec: true
        },
        files: {
            '<%= paths.dist %>css/mobile.css': '<%= files.scss %>',
            '<%= paths.dist %>css/project.css': '<%= paths.scss %>project.scss'
        }
    }
};
