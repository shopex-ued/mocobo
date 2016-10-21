// https://github.com/BrowserSync/grunt-browser-sync
var url = require('url');
var path = require('path');
var grunt = require('grunt');
var proxy = url.parse(grunt.paths.serverRoot);
proxy = url.format(Object.assign(proxy, {
    pathname: path.join(proxy.pathname, grunt.paths.docs)
}));

module.exports = {
    docs: {
        options: {
            proxy: proxy,
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
