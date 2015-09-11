// https://github.com/sindresorhus/grunt-shell
module.exports = {
	dir: {
		options: {
			stderr: false,
			failOnError: false
		},
		command: ['mkdir <%= paths.dist %>', 'mkdir <%= paths.dist %>fonts'].join('&&')
	},
    font: {
        options: {},
        command: 'python <%= paths.builder %>generate.py'
    }
};
