// https://github.com/BrowserSync/grunt-browser-sync
module.exports = {
    docs: {
        options: {
            proxy: 'localhost',
            watchTask: true
        },
        bsFiles: {
            src: ['<%= paths.dist %>**/*', '<%= paths.docs %>**/*']
        }
    }
};
