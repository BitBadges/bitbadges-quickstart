
const fetchFromApi = async (path: string, body?: object | string | undefined, method: string = 'post') => {
  return fetch(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' }
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    throw new Error('Failed to fetch');
  });
};

export const signIn = async (
  authCode: string
): Promise<{
  success: true;
  errorMessage?: string;
}> => {
  return await fetchFromApi('../api/signIn?' + new URLSearchParams({ code: authCode }), undefined, 'post');
};

export const getPrivateInfo = async (): Promise<any> => {
  return await fetchFromApi('../api/getPrivateInfo');
};

export const checkSignIn = async (): Promise<any> => {
  return await fetchFromApi('../api/checkSignIn');
};

export const signOut = async (): Promise<any> => {
  return await fetchFromApi('../api/signOut');
};
