# cli-chromad Specification Delta

## REMOVED Requirements

### Requirement: CHROMA_RUNTIME_DIR Environment Variable

`CHROMA_RUNTIME_DIR` 環境変数は、ランタイムディレクトリのパスを指定しなければならない (SHALL)。

- `--runtime-dir` オプションが指定されていない場合、この環境変数の値が使用されなければならない (SHALL)
- この環境変数が設定されている場合、その値がランタイムディレクトリパスとして使用されなければならない (SHALL)

#### Scenario: 環境変数でランタイムディレクトリを指定

**Given** `CHROMA_RUNTIME_DIR=/var/run/chroma` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/var/run/chroma/chroma.sock` にソケットが作成される

#### Scenario: オプションが環境変数より優先される

**Given** `CHROMA_RUNTIME_DIR=/var/run/chroma` が設定されている  
**When** ユーザーが `chromad --runtime-dir /tmp/chroma` を実行  
**Then** `--runtime-dir` オプションで指定された `/tmp/chroma/chroma.sock` が使用される

---

## MODIFIED Requirements

### Requirement: Runtime Directory Option

`--runtime-dir <PATH>` オプションは、ランタイムディレクトリのパスを指定しなければならない (SHALL)。

- デフォルト値: `${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}/chroma-$UID}/chroma`
- このディレクトリには UNIXドメインソケット (`chroma.sock`) が作成されなければならない (SHALL)

#### Scenario: カスタムランタイムディレクトリを指定

**Given** `/var/run/chroma` ディレクトリが存在する  
**When** ユーザーが `chromad --runtime-dir /var/run/chroma` を実行  
**Then** `/var/run/chroma/chroma.sock` にソケットが作成される

#### Scenario: デフォルトランタイムディレクトリを使用

**Given** `XDG_RUNTIME_DIR=/run/user/1000` が設定されている  
**When** ユーザーが `chromad` を実行  
**Then** `/run/user/1000/chroma/chroma.sock` にソケットが作成される

#### Scenario: XDG_RUNTIME_DIRが設定されていない場合

**Given** `XDG_RUNTIME_DIR` が設定されていない  
**And** `TMPDIR=/tmp` が設定されている  
**And** ユーザーのUID が `1000`  
**When** ユーザーが `chromad` を実行  
**Then** `/tmp/chroma-1000/chroma/chroma.sock` にソケットが作成される
