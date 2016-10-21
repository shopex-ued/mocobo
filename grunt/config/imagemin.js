// https://github.com/gruntjs/grunt-contrib-imagemin
module.exports = {
    static: { // Target
        options: { // Target options
            optimizationLevel: 5,
            svgoPlugins: [{
                removeViewBox: false
            }],
            // use: [require('imagemin-mozjpeg')()]
        },
        files: [{
            expand: true, // Enable dynamic expansion
            cwd: '<%= paths.distImg %>', // Src matches are relative to this path
            src: ['**/*.{png,jpg,jpeg,gif,svg}'], // Actual patterns to match
            dest: '<%= paths.distImg %>' // Destination path prefix
        }]
    }
};
