// https://github.com/gruntjs/grunt-contrib-clean
module.exports = {
    dist: {
        options: {
            force: true
        },
        src: ['<%= paths.distJs %>', '<%= paths.css %>', '<%= paths.fonts %>']
    }
};
