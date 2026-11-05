use std::fs;

use zed_extension_api::{
    self as zed, serde_json, settings::LspSettings, Architecture, DownloadedFileType, GithubReleaseOptions,
    LanguageServerId, LanguageServerInstallationStatus, Os, Result, Worktree,
};

const SERVER_NAME: &str = "nebra";
const RELEASE_REPOSITORY: &str = "nebra-lang/nebra";
const DOWNLOAD_PREFIX: &str = "nebra-";

/// Starts `nebra lps`, the Nebra language server, and passes it the `nebra` settings the way the
/// VS Code extension does.
struct NebraExtension {
    downloaded_binary: Option<String>,
}

/// The `nebra` executable and whether it was found on the `PATH` of the worktree.
struct ServerBinary {
    path: String,
    from_path: bool,
}

impl NebraExtension {
    /// The `nebra` executable to start: the one set in `lsp.nebra.binary.path`, then the one on
    /// the `PATH` of the worktree, then one downloaded from the latest release.
    fn server_binary(&mut self, language_server_id: &LanguageServerId, worktree: &Worktree) -> Result<ServerBinary> {
        let configured = LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|settings| settings.binary)
            .and_then(|binary| binary.path);
        if let Some(path) = configured {
            return Ok(ServerBinary { path, from_path: false });
        }

        if let Some(path) = worktree.which("nebra") {
            return Ok(ServerBinary { path, from_path: true });
        }

        if let Some(path) = self.downloaded_binary.as_ref().filter(|path| is_file(path)) {
            return Ok(ServerBinary { path: path.clone(), from_path: false });
        }

        let path = self.download_binary(language_server_id)?;
        self.downloaded_binary = Some(path.clone());
        Ok(ServerBinary { path, from_path: false })
    }

    /// Downloads `nebra` from the latest release into a directory named after its version, and
    /// removes the versions downloaded before it.
    fn download_binary(&self, language_server_id: &LanguageServerId) -> Result<String> {
        zed::set_language_server_installation_status(language_server_id, &LanguageServerInstallationStatus::CheckingForUpdate);

        let release = zed::latest_github_release(
            RELEASE_REPOSITORY,
            GithubReleaseOptions { require_assets: true, pre_release: false },
        )?;

        let (os, architecture) = zed::current_platform();
        let (asset_name, file_type) = release_asset(os, architecture)?;
        let asset = release
            .assets
            .iter()
            .find(|asset| asset.name == asset_name)
            .ok_or_else(|| format!("the release {} has no asset named {asset_name}", release.version))?;

        let directory = format!("{DOWNLOAD_PREFIX}{}", release.version);
        let binary = format!("{directory}/{}", executable_name(os));
        if is_file(&binary) {
            return Ok(binary);
        }

        zed::set_language_server_installation_status(language_server_id, &LanguageServerInstallationStatus::Downloading);
        zed::download_file(&asset.download_url, &directory, file_type)
            .map_err(|error| format!("could not download {asset_name}: {error}"))?;
        zed::make_file_executable(&binary)?;
        remove_other_versions(&directory);

        zed::set_language_server_installation_status(language_server_id, &LanguageServerInstallationStatus::None);
        Ok(binary)
    }
}

impl zed::Extension for NebraExtension {
    fn new() -> Self {
        Self { downloaded_binary: None }
    }

    fn language_server_command(&mut self, language_server_id: &LanguageServerId, worktree: &Worktree) -> Result<zed::Command> {
        let binary = self.server_binary(language_server_id, worktree)?;
        let arguments = LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|settings| settings.binary)
            .and_then(|binary| binary.arguments)
            .unwrap_or_else(|| vec!["lps".to_string()]);
        let env = if binary.from_path { worktree.shell_env() } else { Vec::new() };

        Ok(zed::Command { command: binary.path, args: arguments, env })
    }

    fn language_server_initialization_options(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let settings = LspSettings::for_worktree(SERVER_NAME, worktree).ok();
        Ok(settings.and_then(|settings| settings.initialization_options.or(settings.settings)))
    }

    fn language_server_workspace_configuration(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let settings = LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|settings| settings.settings)
            .unwrap_or_else(|| serde_json::json!({}));
        Ok(Some(serde_json::json!({ "nebra": settings })))
    }
}

/// The release asset holding `nebra` for the platform Zed runs on, and how it is packed.
fn release_asset(os: Os, architecture: Architecture) -> Result<(String, DownloadedFileType)> {
    let platform = match (os, architecture) {
        (Os::Linux, Architecture::X8664) => "linux-x64",
        (Os::Linux, Architecture::Aarch64) => "linux-arm64",
        (Os::Mac, Architecture::Aarch64) => "osx-arm64",
        (Os::Windows, Architecture::X8664) => "win-x64",
        (Os::Windows, Architecture::Aarch64) => "win-arm64",
        _ => {
            return Err(
                "no Nebra release is built for this platform; install nebra and put it on the PATH, or set lsp.nebra.binary.path"
                    .to_string(),
            )
        }
    };

    Ok(match os {
        Os::Windows => (format!("nebra-{platform}.zip"), DownloadedFileType::Zip),
        _ => (format!("nebra-{platform}.tar.gz"), DownloadedFileType::GzipTar),
    })
}

fn executable_name(os: Os) -> &'static str {
    match os {
        Os::Windows => "nebra.exe",
        _ => "nebra",
    }
}

fn is_file(path: &str) -> bool {
    fs::metadata(path).is_ok_and(|metadata| metadata.is_file())
}

/// Removes the directories of every downloaded version but `keep`.
fn remove_other_versions(keep: &str) {
    let Ok(entries) = fs::read_dir(".") else {
        return;
    };

    for entry in entries.flatten() {
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if name.starts_with(DOWNLOAD_PREFIX) && name != keep {
            fs::remove_dir_all(entry.path()).ok();
        }
    }
}

zed::register_extension!(NebraExtension);
