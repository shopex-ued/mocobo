// https://github.com/BrowserSync/grunt-browser-sync
module.exports = {
    docs: {
        options: {
            proxy: 'http://localhost/mocobo/docs',
            watchTask: true
        },
        bsFiles: {
            src: ['<%= paths.dist %>**/*', '<%= paths.docs %>**/*']
        }
    }
};
