import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../api/backend';

// ปุ่มให้คะแนน + Wishlist
function MovieActions({ movieId }) {
  const { isLoggedIn, token } = useAuth();

  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // โหลด Wishlist ของ user ตอนเปิดหน้าหนัง
  useEffect(() => {
    if (!isLoggedIn || !token) {
      setLoadingWishlist(false);
      return;
    }

    let ignore = false;

    async function loadWishlist() {
      try {
        setLoadingWishlist(true);

        const data = await getWishlist(token);

        const exists = data.items?.some(
          (movie) => String(movie.id) === String(movieId)
        );

        if (!ignore) {
          setInWishlist(Boolean(exists));
        }
      } catch (err) {
        if (!ignore) {
          setMessage(err.message);
        }
      } finally {
        if (!ignore) {
          setLoadingWishlist(false);
        }
      }
    }

    loadWishlist();

    return () => {
      ignore = true;
    };
  }, [movieId, token, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        <Link
          to="/login"
          className="text-emerald-600 hover:underline"
        >
          เข้าสู่ระบบ
        </Link>{' '}
        เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </p>
    );
  }

  async function handleWishlist() {
    if (wishlistLoading || loadingWishlist) return;

    try {
      setWishlistLoading(true);
      setMessage(null);

      if (inWishlist) {
        await removeFromWishlist(movieId, token);

        setInWishlist(false);
        setMessage('นำออกจากรายการที่อยากดูแล้ว');
      } else {
        await addToWishlist(movieId, token);

        setInWishlist(true);
        setMessage('เพิ่มเข้ารายการที่อยากดูแล้ว ❤️');
      }
    } catch (err) {
      setMessage(err.message || 'ไม่สามารถแก้ไขรายการที่อยากดูได้');
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">
          ให้คะแนน
        </span>

        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setMyScore(n)}
            className={
              'h-8 w-8 rounded-lg border text-sm ' +
              (
                myScore === n
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50'
              )
            }
          >
            {n}
          </button>
        ))}
      </div>

      {/* Wishlist */}
      <button
        type="button"
        onClick={handleWishlist}
        disabled={wishlistLoading || loadingWishlist}
        className={
          'rounded-lg border px-4 py-2 text-sm transition ' +
          (
            inWishlist
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50'
          ) +
          (
            wishlistLoading || loadingWishlist
              ? ' cursor-not-allowed opacity-60'
              : ''
          )
        }
      >
        {loadingWishlist
          ? 'กำลังตรวจสอบ...'
          : wishlistLoading
            ? 'กำลังบันทึก...'
            : inWishlist
              ? '❤️ อยู่ในรายการที่อยากดูแล้ว'
              : '🤍 เพิ่มเข้ารายการที่อยากดู'
        }
      </button>

      {message && (
        <p className="text-sm text-slate-500">
          {message}
        </p>
      )}
    </div>
  );
}

export default MovieActions;