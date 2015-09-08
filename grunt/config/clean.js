// https://github.com/gruntjs/grunt-contrib-clean
module.exports = {
    dist: {
        options: {
            force: true
        },
        src: ['<%= paths.dist %>']
    }
};
