import Cookies from 'js-cookie';

export function setToken(token: string) {
  Cookies.set('token', token, { expires: 7 });
}

export function getToken(): string | undefined {
  return Cookies.get('token');
}

export function removeToken() {
  Cookies.remove('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
