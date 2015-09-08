module.exports = function(grunt) {
    // Define project configuration
    var project = {};
    project.paths = {
        get config() {
            return this.grunt + 'config/';
        },
        src: 'src/',
        dist: 'dist/',
        docs: 'docs/',
        grunt: 'grunt/',
        iconbuilder: 'iconbuilder/',
        js: 'src/js/',
        img: 'src/img/',
        icons: 'src/icons/',
        fonts: 'src/fonts/',
        sassLoad: __dirname + '/src/scss',
        scss: 'src/scss/',
        vendor: 'src/vendor/'
    };
    project.files = {
        get config() {
            return project.paths.config + '*.js';
        },
        grunt: 'Gruntfile.js',
        vendor: [
            project.paths.vendor + 'jquery.js',
            project.paths.vendor + 'jquery.cookie.js',
            project.paths.vendor + '*.js'
        ],
        js: [
            project.paths.js + 'component/mobile.js',
            project.paths.js + 'component/*.js'
        ],
        scss: [
            project.paths.scss + 'mobile.scss'
        ]
    };
    project.pkg = grunt.file.readJSON('package.json');

    // Load Grunt configurations and tasks
    require('load-grunt-config')(grunt, {
        configPath: require('path').join(process.cwd(), project.paths.config),
        data: project
    });
};
