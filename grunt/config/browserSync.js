// https://github.com/BrowserSync/grunt-browser-sync
module.exports = {
    docs: {
        options: {
            proxy: 'http://localhost/mocobo/docs',
            online: false,
            open: false,
            notify: false,
            watchTask: true
        },
        bsFiles: {
            src: ['<%= paths.dist %>**/*', '<%= paths.docs %>**/*']
        }
    }
};
