// https://github.com/nDmitry/grunt-postcss
module.exports = {
    dist: {
        options: {
            map: false,
            processors: [
                require('autoprefixer')({
                    browsers: 'android >= 4.1, and_chr >= 40, and_uc >= 9.9, ios_saf >= 8.0'
                }),
                // require('csswring')({
                //     map: true,
                //     preserveHacks: true,
                //     removeAllComments: true
                // })
            ]
        },
        src: [
            '<%= paths.dist %>css/mobile.css'
        ]
    }
}
