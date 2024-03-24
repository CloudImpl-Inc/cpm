## Getting Started

### Clone existing repository

To get started with the project, follow these steps:

#### Clone repository

- **Clone the repository:**
```bash
cpm repo clone <repository-url>
```

- **Navigate to the repository directory:**
```bash
cd $(cpm find <org-name/repo-name>)
```

#### Initialize cpm support

- **Initialize cpm**
```bash
cpm init
```

- **Add required plugins:**
```bash
cpm plugin add <plugin>
```

- **Configure plugin (Only if required)
```bash
cpm plugin configure <plugin>
```

#### Enable cpm flow (Easy development)

- **Enable cpm flow**
```bash
cpm flow enable
```

- **Checkout an issue to start development. This command supports interactive mode where you can select the task:**
```bash
cpm flow checkout
```

- **Submit issue for review**
```bash
cpm flow submit
```