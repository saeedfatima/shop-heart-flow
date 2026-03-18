<?php

function getApiBasePath(): string {
    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    $basePath = rtrim(dirname($scriptName), '/.');

    return $basePath === '/' ? '' : $basePath;
}

function getApiRequestPath(): string {
    $requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $basePath = getApiBasePath();

    if ($basePath !== '' && strpos($requestPath, $basePath) === 0) {
        $requestPath = substr($requestPath, strlen($basePath));
    }

    $requestPath = '/' . ltrim($requestPath ?: '/', '/');
    $requestPath = rtrim($requestPath, '/');

    return $requestPath === '' ? '/' : $requestPath;
}

function getApiScheme(): string {
    $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
    $forwardedProto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));

    if (($https !== '' && $https !== 'off') || $forwardedProto === 'https') {
        return 'https';
    }

    return 'http';
}

function getApiBaseUrl(): string {
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

    return getApiScheme() . '://' . $host . getApiBasePath();
}
