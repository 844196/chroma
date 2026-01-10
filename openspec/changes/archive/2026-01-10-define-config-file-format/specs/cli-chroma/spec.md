# cli-chroma Specification Delta

## MODIFIED Requirements

### Requirement: Profile Option

`-p, --profile <PROFILE>` オプションは、使用するChromeプロファイルを指定しなければならない (SHALL)。

- 指定された値が設定ファイルで定義されたエイリアスの場合、対応するプロファイルディレクトリ名に解決されなければならない (SHALL)
- エイリアス解決は chromad デーモンによって行われなければならない (SHALL)
- エイリアスでない場合、値はそのままプロファイルディレクトリ名として扱われなければならない (SHALL)

関連仕様: [`config-file`](../config-file/spec.md)

#### Scenario: エイリアスを使用してプロファイルを指定

**Given** 設定ファイルに `{"aliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** ユーザーが `chroma -p personal http://localhost:5173` を実行  
**Then** chromad がエイリアス `personal` を `Profile 2` に解決する  
**And** `Profile 2` プロファイルで指定されたURLが開かれる

#### Scenario: プロファイルディレクトリ名を直接指定

**Given** デーモンが起動している  
**When** ユーザーが `chroma --profile "Profile 4" http://localhost:5173` を実行  
**Then** エイリアス解決が行われず `Profile 4` がそのまま使用される  
**And** `Profile 4` プロファイルで指定されたURLが開かれる

#### Scenario: プロファイルオプションを指定しない

**Given** デーモンが起動している  
**And** `CHROMA_PROFILE` 環境変数が設定されていない  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** デフォルトプロファイルで指定されたURLが開かれる

#### Scenario: 未定義のエイリアスを指定

**Given** 設定ファイルに `{"aliases": {"Profile 2": ["personal"]}}` が定義されている  
**When** ユーザーが `chroma -p unknown http://localhost:5173` を実行  
**Then** `unknown` がそのままプロファイルディレクトリ名として扱われる  
**And** `unknown` プロファイルで指定されたURLが開かれる

### Requirement: CHROMA_PROFILE Environment Variable

`CHROMA_PROFILE` 環境変数は、使用するChromeプロファイルを指定しなければならない (SHALL)。

- `-p/--profile` オプションが指定されていない場合、この環境変数の値が使用されなければならない (SHALL)
- この環境変数の値もエイリアス解決の対象でなければならない (SHALL)

関連仕様: [`config-file`](../config-file/spec.md)

#### Scenario: 環境変数でプロファイルエイリアスを指定

**Given** `CHROMA_PROFILE=project-a` が設定されている  
**And** 設定ファイルに `{"aliases": {"Profile 3": ["project-a"]}}` が定義されている  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** chromad がエイリアス `project-a` を `Profile 3` に解決する  
**And** `Profile 3` プロファイルで指定されたURLが開かれる

#### Scenario: オプションが環境変数より優先される

**Given** `CHROMA_PROFILE=project-a` が設定されている  
**When** ユーザーが `chroma -p personal http://localhost:5173` を実行  
**Then** `-p` オプションで指定された `personal` プロファイルが使用される

#### Scenario: 環境変数でプロファイルディレクトリ名を直接指定

**Given** `CHROMA_PROFILE=Profile 5` が設定されている  
**And** 設定ファイルに `Profile 5` のエイリアスが定義されていない  
**When** ユーザーが `chroma http://localhost:5173` を実行  
**Then** `Profile 5` がそのままプロファイルディレクトリ名として使用される
