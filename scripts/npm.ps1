param([Parameter(ValueFromRemainingArguments=$true)][string[]]$NpmArgs)
$runtime = Get-ChildItem "$PSScriptRoot/../.tools" -Directory -Filter 'node-*-win-x64' | Select-Object -First 1
if ($runtime) { $env:Path = "$($runtime.FullName);$env:Path" }
& npm.cmd @NpmArgs
exit $LASTEXITCODE
