import { getCurrentUser, json } from "../../_utils.js";

export async function onRequestGet({ request, env }) {
  const user = await getCurrentUser(request, env);
  if (!user) return json({ user: null });
  return json({ user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } });
}
