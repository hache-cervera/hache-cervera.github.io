<?php
/**
 * Plugin Name: Pulse Connector
 * Description: Expone un endpoint seguro con datos de salud del sitio para el panel Pulse. Un solo fichero, sin dependencias.
 * Version: 0.1.0
 * Author: Hache Cervera
 *
 * Instalación: copiar a wp-content/plugins/ y activar. Definir el token en wp-config.php:
 *   define('PULSE_CONNECTOR_TOKEN', 'un-token-largo-y-aleatorio');
 * El mismo token se guarda en el proyecto dentro de Pulse.
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    register_rest_route('pulse/v1', '/health', [
        'methods' => 'GET',
        'permission_callback' => function ($request) {
            if (!defined('PULSE_CONNECTOR_TOKEN') || PULSE_CONNECTOR_TOKEN === '') return false;
            $given = $request->get_header('X-Pulse-Token') ?: $request->get_param('token');
            return is_string($given) && hash_equals(PULSE_CONNECTOR_TOKEN, $given);
        },
        'callback' => 'pulse_connector_health',
    ]);
});

function pulse_connector_health() {
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/update.php';

    wp_update_plugins();
    $updates = get_site_transient('update_plugins');
    $plugins = [];
    foreach (get_plugins() as $file => $data) {
        $slug = dirname($file) !== '.' ? dirname($file) : basename($file, '.php');
        $plugins[] = [
            'slug' => $slug,
            'file' => $file,
            'name' => $data['Name'],
            'version' => $data['Version'],
            'active' => is_plugin_active($file),
            'update_available' => isset($updates->response[$file]) ? $updates->response[$file]->new_version : null,
        ];
    }

    // Errores PHP recientes del debug.log, agrupados por plugin causante.
    $errors = [];
    $log = WP_CONTENT_DIR . '/debug.log';
    if (is_readable($log)) {
        $lines = pulse_connector_tail($log, 400);
        foreach ($lines as $line) {
            if (stripos($line, 'PHP') === false) continue;
            $source = 'core/tema';
            if (preg_match('#wp-content/plugins/([^/]+)/#', $line, $m)) $source = $m[1];
            elseif (preg_match('#wp-content/themes/([^/]+)/#', $line, $m)) $source = 'tema: ' . $m[1];
            $fatal = stripos($line, 'Fatal') !== false;
            if (!isset($errors[$source])) $errors[$source] = ['count' => 0, 'fatal' => 0, 'last' => ''];
            $errors[$source]['count']++;
            if ($fatal) $errors[$source]['fatal']++;
            $errors[$source]['last'] = substr(trim($line), 0, 500);
        }
    }

    $db_size = (float) $wpdb->get_var($wpdb->prepare(
        'SELECT ROUND(SUM(data_length + index_length) / 1048576, 1) FROM information_schema.TABLES WHERE table_schema = %s',
        DB_NAME
    ));

    $core_update = null;
    wp_version_check();
    $core = get_site_transient('update_core');
    if ($core && !empty($core->updates) && $core->updates[0]->response === 'upgrade') {
        $core_update = $core->updates[0]->version;
    }

    return [
        'wp_version' => get_bloginfo('version'),
        'php_version' => PHP_VERSION,
        'mysql_version' => $wpdb->db_version(),
        'theme' => wp_get_theme()->get('Name') . ' ' . wp_get_theme()->get('Version'),
        'plugins' => $plugins,
        'errors' => $errors,
        'health' => [
            'core_update' => $core_update,
            'cron_disabled' => defined('DISABLE_WP_CRON') && DISABLE_WP_CRON,
            'next_cron' => wp_next_scheduled('wp_version_check') ? date('c', wp_next_scheduled('wp_version_check')) : null,
            'db_size_mb' => $db_size,
            'debug_log_enabled' => defined('WP_DEBUG_LOG') && WP_DEBUG_LOG,
        ],
    ];
}

function pulse_connector_tail($file, $lines) {
    $size = filesize($file);
    $fp = fopen($file, 'r');
    fseek($fp, max(0, $size - 512 * 1024)); // último medio MB como mucho
    $content = stream_get_contents($fp);
    fclose($fp);
    $all = explode("\n", $content);
    return array_slice($all, -$lines);
}
