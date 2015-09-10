# mocob

mocob is a MObile front-end COdeBase. You can quickly prototype and build sites or apps that work on any mobile device with mocob.

#Requirement

- [Git 1.7+](https://git-scm.com/)
- [NodeJS 0.10+](https://nodejs.org/)
- [Sass 3.3+](http://sass-lang.com/)
- [FontForge](http://fontforge.github.io/en-US/)
- [Python 2.7+](https://www.python.org/downloads/)

#Getting Started

```bash
git clone https://github.com/cz848/mocob
cd mocob
npm install -g grunt-cli
npm install
grunt
```
Then you can see the folders list:

```
mocob/
├── dist/
│   └── ...
├── docs/
│   └── ...
├── grunt/
│   └── ...
├── iconbuilder/
│   └── ...
├── src/
│   └── ...
```

If you will watch files' modify and auto refresh documentation page, please run this command:

```bash
grunt watches
```

Enjoy!

#License

mocob is licensed under the [MIT license](LICENSE).