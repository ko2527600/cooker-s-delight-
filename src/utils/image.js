export const getImgUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/assets")) return path; // Frontend public assets
  return `http://localhost:5000${path}`; // Backend uploads
};
