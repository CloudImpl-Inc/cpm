# cpm
CloudImpl Project Manager | Your companion in project managing

## Development
### Start development
Follow bellow steps to setup project for development.

- Clone repository with `git clone https://github.com/CloudImpl-Inc/cpm`
- Go to cloned directory with `cd ./cpm`
- Install dependencies with `npm install`

### Use development version globally
To use development version globally follow these steps.
Then you can test changes realtime.

- Install with `npm install -g .`

### Example project
To test how to develop plugins and to check how to use cli tool 
go to [cpm-example](https://github.com/CloudImpl-Inc/cpm-example)

## Usage
### Install
Follow these steps to install cpm command line tool

- Run `npm install -g @cloudimpl/cpm`
- Run `cpm` and it should show cpm cli usage info

### sample cpm.json
```json
{
  "plugins": [
    "@cloudimpl-inc/cpm-plugin-github",
    "@cloudimpl-inc/cpm-plugin-clickup"
  ],
  "workflows": {
    "checkout-issue": {
      "args": ["repoUrl", "taskId"],
      "steps": [
        {
          "id": "checkout-repo",
          "run": "cpm repo clone {{inputs.repoUrl}}"
        },
        {
          "id": "get-task",
          "run": "cpm task get {{inputs.taskId}}"
        },
        {
          "id": "checkout-branch",
          "run": "cpm repo checkout -b feature/{{get-task.outputs.id}}-{{get-task.outputs.title}}"
        }
      ]
    }
  }
}
```

