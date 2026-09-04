import 'package:shared_preferences/shared_preferences.dart';

class SessionStorage {
  static const String _keyBaseUrl = 'loopkeeper_base_url';
  static const String _keyOfflineMode = 'loopkeeper_offline_mode';
  static const String _keyUserToken = 'loopkeeper_user_token';
  static const String _keyUserId = 'loopkeeper_user_id';
  static const String _keyUserName = 'loopkeeper_user_name';
  static const String _keyUserRole = 'loopkeeper_user_role';

  static const String defaultBaseUrl = 'http://10.0.2.2:8000/api/v1';

  static Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyBaseUrl) ?? defaultBaseUrl;
  }

  static Future<void> setBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, url);
  }

  static Future<bool> isOfflineMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyOfflineMode) ?? false;
  }

  static Future<void> setOfflineMode(bool offline) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyOfflineMode, offline);
  }

  static Future<String?> getUserToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserToken);
  }

  static Future<void> saveUserSession({
    required String token,
    required String userId,
    required String name,
    required String role,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserToken, token);
    await prefs.setString(_keyUserId, userId);
    await prefs.setString(_keyUserName, name);
    await prefs.setString(_keyUserRole, role);
  }

  static Future<Map<String, String>> getUserSession() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'userId': prefs.getString(_keyUserId) ?? '11111111-1111-1111-1111-111111111111',
      'name': prefs.getString(_keyUserName) ?? 'Hasitha (Mobile Lead)',
      'role': prefs.getString(_keyUserRole) ?? 'Manager',
    };
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUserToken);
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyUserName);
    await prefs.remove(_keyUserRole);
  }
}
