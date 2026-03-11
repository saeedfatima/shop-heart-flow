<?php
/**
 * Response Helper Functions
 */

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function successResponse($data, $message = null, $statusCode = 200) {
    $response = ['success' => true];
    if ($message) $response['message'] = $message;
    $response['data'] = $data;
    jsonResponse($response, $statusCode);
}

function errorResponse($message, $statusCode = 400) {
    jsonResponse([
        'success' => false,
        'error' => $message,
        'message' => $message
    ], $statusCode);
}

function notFoundResponse($message = 'Resource not found') {
    errorResponse($message, 404);
}

function unauthorizedResponse($message = 'Unauthorized') {
    errorResponse($message, 401);
}

function validationError($errors) {
    jsonResponse([
        'success' => false,
        'error' => 'Validation failed',
        'errors' => $errors
    ], 422);
}

function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function validateRequired($data, $fields) {
    $errors = [];
    foreach ($fields as $field) {
        // Use array_key_exists so `0` and `false` are treated as present values.
        if (!is_array($data) || !array_key_exists($field, $data) || $data[$field] === null) {
            $errors[$field] = "$field is required";
            continue;
        }

        $value = $data[$field];

        // Strings: empty/whitespace-only is missing
        if (is_string($value) && trim($value) === '') {
            $errors[$field] = "$field is required";
            continue;
        }

        // Arrays: empty array is missing (useful for required list fields like `items`)
        if (is_array($value) && count($value) === 0) {
            $errors[$field] = "$field is required";
        }
    }
    return $errors;
}
