# chroma

chroma is a CLI tool that opens URL in specific Google Chrome profiles.

## Usage

### Setup daemon

```json
// ${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json

{
  "aliases": {
    "Profile 2": ["personal"],
    "Profile 3": ["project-a"],
    "Profile 5": ["project-b"]
  }
}
```

```ini
# ${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user/chromad.service

[Unit]
Description=Chroma Daemon

[Service]
Type=simple
RuntimeDirectory=chroma
RuntimeDirectoryPreserve=yes
Environment=CHROMA_RUNTIME_DIR=%t/chroma
Environment=CHROMA_CONFIG=%E/chroma/config.json
ExecStartPre=rm -f %t/chroma/chroma.sock
ExecStart=/path/to/chromad
ExecStopPost=rm -f %t/chroma/chroma.sock

[Install]
WantedBy=default.target
```

```console
$ systemctl --user daemon-reload
$ systemctl --user start chromad.service
$ systemctl --user enable chromad.service
```

### Basic

```console
$ # i.e. "chrome http://localhost:5173"
$ chroma http://localhost:5173

$ # i.e. "chrome --profile-directory='Profile 2' http://localhost:5173"
$ chroma -p personal http://localhost:5173

$ # i.e. "chrome --profile-directory='Profile 4' http://localhost:5173"
$ chroma -p "Profile 4" http://localhost:5173
```

### With `direnv`

```bash
# /path/to/project-a/.envrc

export BROWSER=chroma
export CHROMA_PROFILE=project-a
```

```console
$ cd /path/to/project-a

$ gh issue list --web
```

### With `devcontainer`

> [!NOTE]
> Make sure that the `chroma` is available inside the dev container.\
> You should install in your dotfiles install script or Dockerfile.

```yaml
# /path/to/project-b/compose.override.yaml

services:
  workspace:
    volumes:
      - $XDG_RUNTIME_DIR/chroma:/tmp/chroma
    environment:
      BROWSER: chroma
      CHROMA_PROFILE: project-b
      CHROMA_HOST: unix:///tmp/chroma/chroma.sock
```

```console
$ # On the host machine
$ devcontainer up --workspace-folder . --dotfiles-repository https://github.com/mona/dotfiles.git

$ # Inside the dev container
$ gh issue list --web
```

## CLI Arguments, Options and Environment Variables

### `chroma`

```
chroma [options] [URL]
```

#### Positional Arguments

- `[URL]`: The URL to open in the Chrome browser instance.

#### Options

| Option                    | Description                                                                                                                                                         | Default                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `-p, --profile <PROFILE>` | Specify the profile to use.<br/><br/>If given value is an alias defined in the configuration file, it will be resolved to the corresponding profile directory name. | N/A                                                                         |
| `-H, --host <HOST>`       | Daemon socket to connect to.                                                                                                                                        | `unix://${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma/chroma.sock` |

#### Environment Variables

- `CHROMA_PROFILE`: Specifies the Chrome profile directory to use.
  - If `-p/--profile` is not specified, and this is set, this value will be used.
- `CHROMA_HOST`: Daemon socket to connect to.
  - If `-H,--host` is not specified, and this is set, this value will be used.

### `chromad`

```
chromad [options]
```

#### Options

| Option                 | Description                     | Default                                                  |
| ---------------------- | ------------------------------- | -------------------------------------------------------- |
| `--config <PATH>`      | Path to the configuration file. | `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json`   |
| `--runtime-dir <PATH>` | Path to the runtime directory.  | `${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma` |

#### Environment Variables

- `CHROMA_CONFIG`: Path to the configuration file.
  - If `--config` is not specified, and this is set, this value will be used.
- `CHROMA_RUNTIME_DIR`: Path to the runtime directory.
  - If `--runtime-dir` is not specified, and this is set, this value will be used.

## Configuration File

Location: `${XDG_CONFIG_HOME:-$HOME/.config}/chroma/config.json`

### Format

The configuration file must be in JSON format.

### Schema

```json
{
  "aliases": {
    "<PROFILE_DIRECTORY_NAME>": ["alias1", "alias2", ...]
  }
}
```

- **Key**: Chrome profile directory name (e.g., `"Default"`, `"Profile 2"`)
- **Value**: Array of alias names for that profile

### Example

```json
{
  "aliases": {
    "Default": ["default", "main"],
    "Profile 2": ["personal", "p"],
    "Profile 3": ["work", "w"]
  }
}
```

### Error Handling

- If the configuration file does not exist, the daemon will start with default settings (no aliases).
- If the configuration file contains invalid JSON or fails validation, it will be ignored and default settings will be
  used.
- Error messages will be logged for troubleshooting.
