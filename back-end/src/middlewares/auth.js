import { verifyToken } from '../services/authService.js';
import * as userService from '../services/userService.js';
import AppError from '../utils/AppError.js';

export const COOKIE_NAME = 'asramacare_token';

/**
 * Membaca JWT dari cookie httpOnly. Header Authorization: Bearer tetap
 * didukung agar API mudah diuji dengan Postman/curl.
 */
function readToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export function authenticate(req, res, next) {
  const token = readToken(req);
  if (!token) return next(AppError.unauthorized());

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(AppError.unauthorized('Sesi Anda telah berakhir, silakan login kembali'));
  }

  // Data pengguna selalu diambil ulang dari database, sehingga perubahan role
  // atau akun yang dihapus langsung berlaku.
  const user = userService.findById(Number(payload.sub));
  if (!user) return next(AppError.unauthorized('Sesi Anda telah berakhir, silakan login kembali'));

  req.user = user;
  return next();
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    return next();
  };
}
