// https://github.com/gruntjs/grunt-contrib-copy
module.exports = {
    vendor: {
        files: [{
            expand: true,
            cwd: '<%= paths.vendor %>',
            src: ['*.*'],
            dest: '<%= paths.distJs %>libs',
            filter: 'isFile'
        }]
    }
};
