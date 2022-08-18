import { supabase } from "./supabase";

export async function isAuthorised(req, res, next) {
  const token = req.get("X-Supabase-Auth") || null;

  if (!token) {
    var err = new Error("Not authorized");
    err.status = 401;
    return next(err);
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(token);
    if (error) return next(error);

    // pass user object to router
    res.locals.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
}
