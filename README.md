# cpm
CloudImpl Project Manager | Your companion in project managing

## Usage
### Install
Follow these steps to install cpm command line tool

- Install [NodeJS](https://nodejs.org/en/download)
- Install cpm globally with `npm install -g @cloudimpl-inc/cpm`
- Add cpm-git plugin globally with `cpm plugin add -g @cloudimpl-inc/cpm-git`
- Check cpm version with `cpm -V`

## Plugin development
- Go to [cpm-plugin-gs](https://github.com/CloudImpl-Inc/cpm-plugin-gs) and follow steps
- Sample plugin is available in [cpm-plugin-sample](https://github.com/CloudImpl-Inc/cpm-plugin-sample)

## Development
### Start development
Follow bellow steps to set up project for development.

- Clone repository with `cpm repo clone https://github.com/CloudImpl-Inc/cpm`
- Go to repository with `cd $(cpm find cpm)`
- Install dependencies with `npm install`

### Use development version globally
To use development version globally follow these steps.
Then you can test changes realtime.

- Install with `npm install -g .`

