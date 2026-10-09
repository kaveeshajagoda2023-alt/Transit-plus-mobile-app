// >>> EDIT THIS when your laptop's Wi-Fi IP changes <<<
// The phone reaches the backend over the LAN, so this must be the laptop's IPv4
// address (PowerShell: ipconfig -> "Wireless LAN adapter Wi-Fi" -> IPv4 Address).
// Never use localhost / 127.0.0.1 here - on the phone that means the phone itself.
export const API_BASE_URL = 'http://192.168.8.170:5000/api';

export const REQUEST_TIMEOUT_MS = 15000;
