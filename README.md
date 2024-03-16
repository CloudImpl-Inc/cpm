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
go to [cpm-plugins-example](https://github.com/CloudImpl-Inc/cpm-example)

## Usage
Currently, not deployed to npm. After deploying can install as a normal npm package

### cpm commands

- cpm ls
- cpm cd <path: org or org/repo>
- cpm install
- cpm open --editor <executable>
- cpm repo clone <url>
- cpm repo checkout -b <branch>
- cpm task list
- cpm task get <id>
- cpm task update-status <status>

### cpm default workflows

#### checkout task

```yaml
- inputs:
    - repo-url
    - task-id
    
- steps:     
    - id: checkout-repo
      run: cpm repo clone ${{ inputs.repo-url }}
    
    - id: open-repo
      run: cpm cd ${{ checkout-repo.outputs.path }}
      
    - id: install-plugins
      run: cpm install
      
    - id: get-task
      run: cpm task get ${{ inputs.task-id }}
    
    - id: checkout-branch
      run: cpm repo checkout -b feature/${{ get-task.outputs.id }}-${{ get-task.outputs.title }}
```

