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
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $errors[$field] = "$field is required";
        }
    }
    return $errors;
}
