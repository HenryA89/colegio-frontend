export async function apiFetch(endpoint, options = {}) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = usuario?.token;

  const response = await fetch(`http://localhost:3000/api/v1/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error("Error en la petición");
  }

  return response.json();
}
