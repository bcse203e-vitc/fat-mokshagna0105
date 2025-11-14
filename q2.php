<?php
function lineSum(string $filename, int $lineNumber): int {
    if (!file_exists($filename)) {
        return 0;
    }
    $sum = 0;
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lineNumber > count($lines)) {
        return 0;
    }
    $targetLine = trim($lines[$lineNumber - 1]);
    if (strpos($targetLine, '#') === 0) {
        $targetLine = ltrim($targetLine, '#');
    }
    $tokens = explode(' ', $targetLine);
    foreach ($tokens as $token) {
        if (is_numeric($token)) {
            $sum += (int)$token;
        }
    }
    return $sum;
}
$filename = 'sums.txt';
$lineNumber=2;
$result = lineSum($filename, $lineNumber);
echo "lineSum (\"sums.txt\", $lineNumber) -> $result";
?>
