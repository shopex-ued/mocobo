// https://github.com/sindresorhus/grunt-shell
module.exports = {
    font: {
        options: {},
        command: 'python <%= paths.iconbuilder %>generate.py'
    }
};
