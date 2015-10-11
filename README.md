# mocobo

mocobo is a MObile front-end COdeBase for quickly develOp. You can quickly prototype and build sites or apps that work on any mobile device with mocobo.

#Requirement

- [Git 1.7+](https://git-scm.com/)
- [NodeJS 0.10+](https://nodejs.org/)
- [Sass 3.3+](http://sass-lang.com/)
- [FontForge](http://fontforge.github.io/en-US/)
- [ttfautohint](http://www.freetype.org/ttfautohint/)
- [Python 2.7+](https://www.python.org/downloads/)

#Getting Started

```bash
git clone https://github.com/shopex-ued/mocobo
cd mocobo
npm install -g grunt-cli
npm install
grunt
```
#Project Structure

```
mocobo/
├── dist/
│   └── ...
├── docs/
│   └── ...
├── grunt/
│   └── ...
├── fontbuilder/
│   └── ...
└── src/
    └── ...
```

If you will watch files' modify and auto refresh documentation page, please run this command:

```bash
grunt watches
```

Enjoy!

#Standing On the Shoulder Of Giants

- Foundation
- mui
- Frozen UI
- animate.css

#License

mocobo is licensed under the [MIT license](LICENSE).
