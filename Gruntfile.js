module.exports = function(grunt) {
    // Define project configuration
    var path = require('path');
    var project = {};

    project.paths = {
        get config() {
            return this.grunt + 'config/';
        },
        serverRoot: 'http://localhost/mocobo',
        src: 'src/',
        dist: 'dist/',
        docs: 'docs/',
        grunt: 'grunt/',
        vendor: '<%= paths.src %>vendor/',
        js: '<%= paths.src %>js/',
        distJs: '<%= paths.dist %>js/',
        distImg: '<%= paths.docs %>img/',
        scss: '<%= paths.src %>scss/',
        css: '<%= paths.dist %>css/',
        builder: 'fontbuilder/',
        icons: '<%= paths.builder %>icons/',
        fonts: '<%= paths.dist %>fonts/',
        sassLoad: path.join(__dirname, '<%= paths.scss %>')
    };
    project.files = {
        get config() {
            return '<%= paths.config %>*.js';
        },
        grunt: 'Gruntfile.js',
        vendor: [
            '<%= paths.vendor %>jquery.js',
            '<%= paths.vendor %>jquery.cookie.js',
            '<%= paths.vendor %>*.js'
        ],
        js: [
            '<%= paths.js %>mobile.js',
            '<%= paths.js %>components/*.js'
        ],
        scss: [
            '<%= paths.scss %>mobile.scss'
        ]
    };
    project.pkg = grunt.file.readJSON('package.json');
    grunt.paths = project.paths;

    // Load Grunt configurations and tasks
    require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), project.paths.config),
        data: project
    });
};
