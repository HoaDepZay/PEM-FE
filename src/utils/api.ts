const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let token = localStorage.getItem('token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          token = data.data.token;
          const newRefreshToken = data.data.refresh_token;

          localStorage.setItem('token', token!);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry the original request with the new token
          headers.set('Authorization', `Bearer ${token}`);
          response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers,
          });
        } else {
          // Refresh token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
};
