// https://github.com/gruntjs/grunt-contrib-copy
module.exports = {
    font: {
        files: [{
            expand: true,
            cwd: '<%= paths.fonts %>',
            src: ['*.*'],
            dest: '<%= paths.dist %>fonts',
            filter: 'isFile'
        }]
    },
    dist: {
        files: [{
            expand: true,
            cwd: '<%= paths.img %>',
            src: ['*.*'],
            dest: '<%= paths.dist %>img',
            filter: 'isFile'
        }]
    },
    vendor: {
        files: [{
            expand: true,
            cwd: '<%= paths.vendor %>',
            src: ['*.*'],
            dest: '<%= paths.dist %>js/libs',
            filter: 'isFile'
        }]
    }
};
